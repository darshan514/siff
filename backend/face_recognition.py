import os
import numpy as np
import cv2
import onnxruntime as ort
from pathlib import Path
from fastapi import UploadFile

# Model storage directory
MODEL_DIR = Path(__file__).parent.parent / "models" / "face"
ARCFACE_MODEL_PATH = MODEL_DIR / "arc.onnx"

_ort_session = None
_face_detector = None

def _ensure_model_downloaded():
    """Download ArcFace ONNX model from Hugging Face if not present."""
    if ARCFACE_MODEL_PATH.exists():
        return
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print("Downloading ArcFace ONNX model from Hugging Face...")
    try:
        from huggingface_hub import hf_hub_download
        downloaded_path = hf_hub_download(
            repo_id="garavv/arcface-onnx",
            filename="arc.onnx",
            local_dir=str(MODEL_DIR),
            local_dir_use_symlinks=False
        )
        print(f"ArcFace model downloaded to: {downloaded_path}")
    except Exception as e:
        print(f"Error downloading ArcFace model: {e}")
        raise RuntimeError("Failed to download ArcFace ONNX model.") from e

def _get_ort_session():
    global _ort_session
    if _ort_session is None:
        _ensure_model_downloaded()
        _ort_session = ort.InferenceSession(
            str(ARCFACE_MODEL_PATH),
            providers=["CPUExecutionProvider"]
        )
    return _ort_session

def _get_face_detector():
    global _face_detector
    if _face_detector is None:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        _face_detector = cv2.CascadeClassifier(cascade_path)
    return _face_detector

async def detect_and_crop_face(file: UploadFile) -> np.ndarray:
    image_bytes = await file.read()
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image")
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    detector = _get_face_detector()
    faces = detector.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60), flags=cv2.CASCADE_SCALE_IMAGE
    )
    
    if len(faces) == 0:
        faces = detector.detectMultiScale(
            gray, scaleFactor=1.05, minNeighbors=3, minSize=(40, 40), flags=cv2.CASCADE_SCALE_IMAGE
        )
    
    if len(faces) == 0:
        raise ValueError("No face detected in the image. Please ensure your face is clearly visible.")
    if len(faces) > 1:
        raise ValueError("Multiple faces detected. Please ensure only your face is visible.")
    
    faces_sorted = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
    x, y, w, h = faces_sorted[0]
    
    margin = int(max(w, h) * 0.2)
    x1 = max(0, x - margin)
    y1 = max(0, y - margin)
    x2 = min(img.shape[1], x + w + margin)
    y2 = min(img.shape[0], y + h + margin)
    
    face_crop = img[y1:y2, x1:x2]
    face_resized = cv2.resize(face_crop, (112, 112), interpolation=cv2.INTER_AREA)
    
    face_rgb = cv2.cvtColor(face_resized, cv2.COLOR_BGR2RGB)
    face_normalized = (face_rgb.astype(np.float32) - 127.5) / 127.5
    
    face_tensor = np.transpose(face_normalized, (2, 0, 1))
    face_tensor = np.expand_dims(face_tensor, axis=0)
    
    return face_tensor

async def extract_embedding(file: UploadFile) -> list:
    face_tensor = await detect_and_crop_face(file)
    session = _get_ort_session()
    input_name = session.get_inputs()[0].name
    result = session.run(None, {input_name: face_tensor})
    embedding = result[0][0]
    
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    return embedding.tolist()

def cosine_similarity(vec_a: list, vec_b: list) -> float:
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot_product / (norm_a * norm_b))

def match_face(live_embedding: list, stored_embeddings_list: list, threshold: float = 0.45) -> tuple:
    best_sim = -1.0
    for stored_emb in stored_embeddings_list:
        if len(stored_emb) != len(live_embedding):
            continue
        sim = cosine_similarity(live_embedding, stored_emb)
        if sim > best_sim:
            best_sim = sim
    return (best_sim >= threshold, best_sim)

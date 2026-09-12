import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FaceCapture = ({ onCapture, label = 'Position Face Inside Oval', isLogin = false }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsCapturing(true);
    
    // Draw current video frame to canvas
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob
    canvas.toBlob(
      async (blob) => {
        if (blob) {
          try {
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Verification timed out. Please try again.')), 10000)
            );
            await Promise.race([onCapture(blob), timeoutPromise]);
            // If onCapture succeeds, it will usually unmount. But if not, we stop capturing.
            setIsCapturing(false);
          } catch (err) {
            setError(err.message || 'Face detection failed. Please try again.');
            setIsCapturing(false);
          }
        } else {
          setError('Failed to capture image');
          setIsCapturing(false);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto space-y-6">
      <div className="relative w-72 h-72 rounded-full overflow-hidden border-4 border-[#FF5E3A]/30 shadow-2xl bg-slate-900">
        
        {/* Camera Feed */}
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-400 text-sm p-6 text-center">
            {error}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
          />
        )}

        {/* Overlay Guide */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <ellipse
              cx="50"
              cy="50"
              rx="35"
              ry="45"
              fill="none"
              stroke={isCapturing ? "#FF5E3A" : "rgba(255, 255, 255, 0.4)"}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          </svg>
        </div>

        {/* Scanning Animation */}
        {!error && !isCapturing && (
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-[#FF5E3A] shadow-[0_0_8px_2px_rgba(255,94,58,0.5)] z-20"
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Capturing Overlay */}
        <AnimatePresence>
          {isCapturing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/40 z-30 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="w-8 h-8 border-4 border-[#FF5E3A] border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-extrabold text-slate-900">{label}</h3>
        <p className="text-sm text-slate-500 font-medium">Ensure your face is well-lit and clearly visible.</p>
      </div>

      <button
        onClick={() => {
          if (error) {
            setError(null);
            startCamera();
          } else {
            handleCapture();
          }
        }}
        disabled={isCapturing}
        className="w-full py-3.5 px-6 rounded-2xl bg-[#FF5E3A] hover:bg-[#E04D2D] text-white font-bold transition-all shadow-lg hover:shadow-[#FF5E3A]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined">{error ? 'refresh' : (isLogin ? 'face_retouching_natural' : 'camera')}</span>
        {isCapturing ? 'Processing...' : error ? 'Try Again' : (isLogin ? 'Login with Face' : 'Capture Biometric Frame')}
      </button>

      {/* Hidden canvas for image extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FaceCapture;

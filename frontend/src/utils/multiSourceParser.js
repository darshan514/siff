/**
 * Multi-Source Data Ingestion Parser for Oil India Limited
 * 
 * Supports:
 * - CSV files (.csv)
 * - Excel spreadsheets (.xlsx, .xls)
 * - Text incident logs & memos (.txt)
 * - Email-like incident communications (.eml, .txt)
 * - Structured JSON records (.json)
 * - Audio recordings (.mp3, .wav, .m4a, .webm, .ogg)
 */

import * as XLSX from 'xlsx';

export const parseMultiSourceFile = async (file) => {
  if (!file) throw new Error("No file provided");

  const fileName = file.name || "";
  const fileExt = fileName.split('.').pop().toLowerCase();

  // 1. Audio Files
  if (['mp3', 'wav', 'm4a', 'webm', 'ogg', 'aac'].includes(fileExt) || file.type.startsWith('audio/')) {
    return {
      type: 'audio',
      file,
      fileName,
      sizeBytes: file.size,
      message: `Audio file detected: ${fileName}. Ready for Speech-to-Text transcription.`,
      narratives: []
    };
  }

  // 2. Excel Spreadsheets (.xlsx, .xls)
  if (fileExt === 'xlsx' || fileExt === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (!jsonRows || jsonRows.length === 0) {
            resolve({ type: 'excel', fileName, narratives: [], rawText: '' });
            return;
          }

          // Header row detection
          const headers = jsonRows[0].map(h => (h || '').toString().toLowerCase().trim());
          let textColIdx = headers.findIndex(h => 
            h.includes('report') || h.includes('narrative') || h.includes('observation') || 
            h.includes('description') || h.includes('incident') || h.includes('detail')
          );

          if (textColIdx === -1) {
            // Find first column with substantial text
            textColIdx = 0;
            for (let c = 0; c < (jsonRows[1] || []).length; c++) {
              if (typeof jsonRows[1][c] === 'string' && jsonRows[1][c].length > 10) {
                textColIdx = c;
                break;
              }
            }
          }

          const extracted = [];
          for (let r = 1; r < jsonRows.length; r++) {
            const row = jsonRows[r];
            if (row && row[textColIdx]) {
              const val = row[textColIdx].toString().trim();
              if (val.length > 5) {
                extracted.push(val);
              }
            }
          }

          resolve({
            type: 'excel',
            fileName,
            sheetName: firstSheetName,
            rowCount: extracted.length,
            narratives: extracted,
            rawText: extracted.join('\n')
          });
        } catch (err) {
          reject(new Error(`Failed to parse Excel file: ${err.message}`));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  // 3. JSON Files
  if (fileExt === 'json') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          let extracted = [];
          if (Array.isArray(parsed)) {
            extracted = parsed.map(item => {
              if (typeof item === 'string') return item;
              return item.report || item.narrative || item.description || item.text || JSON.stringify(item);
            }).filter(t => t && t.length > 5);
          } else if (typeof parsed === 'object') {
            const items = parsed.reports || parsed.data || parsed.observations || [parsed];
            extracted = items.map(item => item.report || item.narrative || item.description || item.text || '').filter(t => t.length > 5);
          }
          resolve({
            type: 'json',
            fileName,
            narratives: extracted,
            rawText: extracted.join('\n')
          });
        } catch (err) {
          reject(new Error(`Failed to parse JSON file: ${err.message}`));
        }
      };
      reader.readAsText(file);
    });
  }

  // 4. CSV & Text Files (.csv, .txt, .eml, .log)
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const rawLines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

      if (rawLines.length === 0) {
        resolve({ type: fileExt === 'csv' ? 'csv' : 'text', fileName, narratives: [], rawText: '' });
        return;
      }

      let extractedNarratives = [];
      const header = rawLines[0].toLowerCase();

      // Check if it's an email/memo format (e.g. starts with "From:", "Subject:", "Date:")
      const isEmailMemo = rawLines.some(l => l.toLowerCase().startsWith('subject:') || l.toLowerCase().startsWith('from:'));
      if (isEmailMemo) {
        // Concatenate body as a unified observation narrative or extract action points
        const bodyLines = rawLines.filter(l => !l.match(/^(from|to|date|subject|cc):/i));
        const combined = bodyLines.join(' ').replace(/\s+/g, ' ').trim();
        if (combined.length > 10) {
          extractedNarratives = [combined];
        }
      } else if (header.includes(',') && (header.includes('report') || header.includes('narrative') || header.includes('observation') || header.includes('id'))) {
        // Multi-column CSV
        const headerCols = rawLines[0].split(',').map(c => c.trim().toLowerCase().replace(/^"|"$/g, ''));
        let textColIdx = headerCols.findIndex(c => 
          c === 'report_text' || c === 'report' || c === 'narrative' || 
          c === 'observation' || c === 'description' || c === 'incident_description'
        );
        if (textColIdx === -1) textColIdx = 1;

        for (let i = 1; i < rawLines.length; i++) {
          const matches = rawLines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || rawLines[i].split(',');
          if (matches && matches[textColIdx]) {
            const val = matches[textColIdx].replace(/^"|"$/g, '').trim();
            if (val.length > 5) extractedNarratives.push(val);
          }
        }
      } else {
        // Plain line-by-line observations
        extractedNarratives = rawLines
          .map(l => l.replace(/^"|"$/g, '').trim())
          .filter(l => l.length > 5 && !l.toLowerCase().startsWith('report_id') && !l.toLowerCase().startsWith('incident_id'));
      }

      resolve({
        type: fileExt === 'csv' ? 'csv' : (isEmailMemo ? 'email' : 'text'),
        fileName,
        rowCount: extractedNarratives.length,
        narratives: extractedNarratives,
        rawText: extractedNarratives.join('\n')
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

// Preset Oil India Multi-Source Samples
export const SAMPLE_MULTI_SOURCE = {
  EXCEL_MAINTENANCE: [
    "Pump P-102 (Booster) seal failed 3 times this week; vibration alarm triggered at 4.2 mm/s with crude leakage near dike.",
    "Gas Compressor C-3 high discharge temperature (142°C) bypassed by operator without formal MOC authorization.",
    "415V MCC breaker tripped twice during heavy drilling drawworks load at Rig #7; contactors heavily charred.",
    "Crude trunk pipeline section B ultrasound test reveals 42% wall thickness reduction due to internal microbial corrosion.",
    "Elevated walkway grating unbolted at Duliajan Gas Plant Unit 4 without safety netting or fall barricade."
  ],
  INCIDENT_EMAIL: [
    "URGENT INCIDENT MEMO: During morning shift turnover at Moran Wellsite #14, contractor crew initiated workover operations without verifying zero-energy state on the hydraulic power unit. Secondary hydraulic line ruptured under 210 bar pressure, spraying fluid over hot manifold. No injuries reported but operations halted immediately pending safety investigation."
  ],
  AUDIO_TRANSCRIPT_DEMO: "The booster pump has failed three times this week and production is being delayed by nearly four hours. The vibration is getting worse and there is oil leaking on the pad."
};

export default {
  parseMultiSourceFile,
  SAMPLE_MULTI_SOURCE
};

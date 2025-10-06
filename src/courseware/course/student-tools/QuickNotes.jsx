import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@openedx/paragon';
import {
  Download,
  Delete,
  ContentCopy,
  Save,
  Notes as NotesIcon,
} from '@openedx/paragon/icons';
import './QuickNotes.scss';

const QuickNotes = () => {
  const [notes, setNotes] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const textareaRef = useRef(null);

  // Load notes from sessionStorage on mount
  useEffect(() => {
    const savedNotes = sessionStorage.getItem('student-quick-notes');
    const savedTime = sessionStorage.getItem('student-quick-notes-time');
    if (savedNotes) {
      setNotes(savedNotes);
      if (savedTime) {
        setLastSaved(new Date(savedTime));
      }
    }
  }, []);

  // Auto-save to sessionStorage
  useEffect(() => {
    if (notes !== '') {
      const saveTimer = setTimeout(() => {
        sessionStorage.setItem('student-quick-notes', notes);
        sessionStorage.setItem('student-quick-notes-time', new Date().toISOString());
        setLastSaved(new Date());
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
      }, 1000); // Auto-save after 1 second of no typing

      return () => {
        clearTimeout(saveTimer);
      };
    }
    return undefined;
  }, [notes]);

  // Update word and character count
  useEffect(() => {
    const words = notes.trim() === '' ? 0 : notes.trim().split(/\s+/).length;
    const chars = notes.length;
    setWordCount(words);
    setCharCount(chars);
  }, [notes]);

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleClear = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ ghi chú?')) {
      setNotes('');
      sessionStorage.removeItem('student-quick-notes');
      sessionStorage.removeItem('student-quick-notes-time');
      setLastSaved(null);
    }
  };

  const handleDownload = () => {
    if (notes.trim() === '') {
      // eslint-disable-next-line no-alert
      alert('Ghi chú trống, không thể tải xuống!');
      return;
    }

    const blob = new Blob([notes], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.href = url;
    link.download = `ghi-chu-${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (notes.trim() === '') {
      // eslint-disable-next-line no-alert
      alert('Ghi chú trống, không thể sao chép!');
      return;
    }

    try {
      await navigator.clipboard.writeText(notes);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert('Không thể sao chép vào clipboard!');
    }
  };

  const handleManualSave = () => {
    sessionStorage.setItem('student-quick-notes', notes);
    sessionStorage.setItem('student-quick-notes-time', new Date().toISOString());
    setLastSaved(new Date());
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const insertTemplate = (template) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = notes.substring(0, start) + template + notes.substring(end);
    setNotes(newText);
    // Set cursor position after inserted text
    setTimeout(() => {
      const newPosition = start + template.length;
      textarea.selectionStart = newPosition;
      textarea.selectionEnd = newPosition;
      textarea.focus();
    }, 0);
  };

  const templates = [
    { label: 'Tiêu đề', value: '\n# ----------\n\n' },
    { label: 'Bullet', value: '\n• ' },
    { label: 'Số', value: '\n1. ' },
    { label: 'Todo', value: '\n☐ ' },
    { label: 'Quan trọng', value: '\n⭐ ' },
  ];

  return (
    <div className="quick-notes">
      <div className="notes-header">
        <div className="header-info">
          <Icon src={NotesIcon} className="notes-icon" />
          <div className="save-status">
            {isSaving && <span className="saving">Đang lưu...</span>}
            {lastSaved && !isSaving && (
              <span className="last-saved">
                Lưu lúc: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            {!lastSaved && !isSaving && (
              <span className="not-saved">Chưa lưu</span>
            )}
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="action-btn"
            onClick={handleManualSave}
            title="Lưu ngay"
          >
            <Icon src={Save} />
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={handleCopy}
            title="Sao chép"
          >
            <Icon src={ContentCopy} />
            {showCopied && <span className="copied-tooltip">Đã sao chép!</span>}
          </button>
          <button
            type="button"
            className="action-btn"
            onClick={handleDownload}
            title="Tải xuống .txt"
          >
            <Icon src={Download} />
          </button>
          <button
            type="button"
            className="action-btn danger"
            onClick={handleClear}
            title="Xóa tất cả"
          >
            <Icon src={Delete} />
          </button>
        </div>
      </div>

      <div className="notes-toolbar">
        <div className="toolbar-label">Mẫu nhanh:</div>
        {templates.map((template) => (
          <button
            key={template.label}
            type="button"
            className="template-btn"
            onClick={() => insertTemplate(template.value)}
          >
            {template.label}
          </button>
        ))}
      </div>

      <div className="notes-editor">
        <textarea
          ref={textareaRef}
          className="notes-textarea"
          value={notes}
          onChange={handleNotesChange}
          placeholder="Bắt đầu ghi chú của bạn...&#10;&#10;💡 Mẹo:&#10;- Ghi chú được lưu tự động&#10;- Tồn tại đến hết phiên làm việc&#10;- Sử dụng mẫu nhanh để định dạng&#10;- Tải xuống để lưu vĩnh viễn"
          spellCheck="true"
        />
      </div>

      <div className="notes-footer">
        <div className="stats">
          <span className="stat-item">
            <strong>{wordCount}</strong> từ
          </span>
          <span className="stat-separator">•</span>
          <span className="stat-item">
            <strong>{charCount}</strong> ký tự
          </span>
        </div>
        <div className="info-text">
          <small>Ghi chú được lưu trong phiên làm việc</small>
        </div>
      </div>
    </div>
  );
};

export default QuickNotes;

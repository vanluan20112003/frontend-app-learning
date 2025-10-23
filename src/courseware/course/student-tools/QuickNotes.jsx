import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@openedx/paragon';
import {
  Download,
  Delete,
  ContentCopy,
  Save,
  Notes as NotesIcon,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  FormatQuote,
  Link,
  InsertPhoto,
  Undo,
  Redo,
} from '@openedx/paragon/icons';
import './QuickNotes.scss';

const QuickNotes = () => {
  const [lastSaved, setLastSaved] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const editorRef = useRef(null);

  // Update word and character count
  const updateStats = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
      const chars = text.length;
      setWordCount(words);
      setCharCount(chars);
    }
  };

  // Load notes from sessionStorage on mount
  useEffect(() => {
    const savedNotes = sessionStorage.getItem('student-quick-notes');
    const savedTime = sessionStorage.getItem('student-quick-notes-time');
    if (savedNotes && editorRef.current) {
      editorRef.current.innerHTML = savedNotes;
      if (savedTime) {
        setLastSaved(new Date(savedTime));
      }
      updateStats();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to sessionStorage
  useEffect(() => {
    const handleInput = () => {
      updateStats();

      const saveTimer = setTimeout(() => {
        if (editorRef.current) {
          const content = editorRef.current.innerHTML;
          sessionStorage.setItem('student-quick-notes', content);
          sessionStorage.setItem('student-quick-notes-time', new Date().toISOString());
          setLastSaved(new Date());
          setIsSaving(true);
          setTimeout(() => setIsSaving(false), 1000);
        }
      }, 1000);

      return () => clearTimeout(saveTimer);
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('input', handleInput);
      return () => {
        editor.removeEventListener('input', handleInput);
      };
    }
    return undefined;
  }, []);

  // Rich text formatting functions using execCommand
  const formatBold = () => {
    document.execCommand('bold', false, null);
    editorRef.current?.focus();
  };

  const formatItalic = () => {
    document.execCommand('italic', false, null);
    editorRef.current?.focus();
  };

  const formatUnderline = () => {
    document.execCommand('underline', false, null);
    editorRef.current?.focus();
  };

  const formatCode = () => {
    const selectedText = window.getSelection().toString() || 'code';
    document.execCommand('insertHTML', false, `<code>${selectedText}</code>`);
    editorRef.current?.focus();
  };

  const formatQuote = () => {
    document.execCommand('formatBlock', false, 'blockquote');
    editorRef.current?.focus();
  };

  const formatHeading = (level) => {
    document.execCommand('formatBlock', false, `h${level}`);
    editorRef.current?.focus();
  };

  const formatList = (ordered = false) => {
    document.execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList', false, null);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    // eslint-disable-next-line no-alert
    const url = prompt('Nhập URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      editorRef.current?.focus();
    }
  };

  const insertImage = () => {
    // eslint-disable-next-line no-alert
    const url = prompt('Nhập URL hình ảnh:');
    if (url) {
      document.execCommand('insertImage', false, url);
      editorRef.current?.focus();
    }
  };

  const handleUndo = () => {
    document.execCommand('undo', false, null);
    editorRef.current?.focus();
  };

  const handleRedo = () => {
    document.execCommand('redo', false, null);
    editorRef.current?.focus();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + B for Bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        formatBold();
      }
      // Ctrl/Cmd + I for Italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        formatItalic();
      }
      // Ctrl/Cmd + U for Underline
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        formatUnderline();
      }
      // Ctrl/Cmd + Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z for Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('keydown', handleKeyDown);
      return () => {
        editor.removeEventListener('keydown', handleKeyDown);
      };
    }
    return undefined;
  }, []);

  const handleClear = () => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ ghi chú?')) {
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
      sessionStorage.removeItem('student-quick-notes');
      sessionStorage.removeItem('student-quick-notes-time');
      setLastSaved(null);
      updateStats();
    }
  };

  const handleDownload = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      if (text.trim() === '') {
        // eslint-disable-next-line no-alert
        alert('Ghi chú trống, không thể tải xuống!');
        return;
      }

      // Download as HTML to preserve formatting
      const htmlContent = editorRef.current.innerHTML;
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ghi chú</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
    blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #666; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.href = url;
      link.download = `ghi-chu-${timestamp}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = async () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      if (text.trim() === '') {
        // eslint-disable-next-line no-alert
        alert('Ghi chú trống, không thể sao chép!');
        return;
      }

      try {
        // Copy both HTML and plain text to clipboard
        const htmlContent = editorRef.current.innerHTML;
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([htmlContent], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        });
        await navigator.clipboard.write([clipboardItem]);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      } catch (err) {
        // Fallback to plain text if clipboard API fails
        try {
          await navigator.clipboard.writeText(text);
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
        } catch (fallbackErr) {
          // eslint-disable-next-line no-alert
          alert('Không thể sao chép vào clipboard!');
        }
      }
    }
  };

  const handleManualSave = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      sessionStorage.setItem('student-quick-notes', content);
      sessionStorage.setItem('student-quick-notes-time', new Date().toISOString());
      setLastSaved(new Date());
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 1000);
    }
  };

  const insertTemplate = (template) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const textNode = document.createTextNode(template);
      range.insertNode(textNode);

      // Move cursor to end of inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);

      editorRef.current.focus();
      updateStats();
    }
  };

  const templates = [
    { label: 'Tiêu đề', value: '──────────\n\n' },
    { label: 'Bullet', value: '• ' },
    { label: 'Số', value: '1. ' },
    { label: 'Todo', value: '☐ ' },
    { label: 'Quan trọng', value: '⭐ ' },
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
            title="Tải xuống .html"
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

      {/* Rich Text Formatting Toolbar */}
      <div className="formatting-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className="format-btn"
            onClick={handleUndo}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Icon src={Undo} />
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={handleRedo}
            title="Làm lại (Ctrl+Y)"
          >
            <Icon src={Redo} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className="format-btn"
            onClick={formatBold}
            title="Đậm (Ctrl+B)"
          >
            <Icon src={FormatBold} />
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={formatItalic}
            title="Nghiêng (Ctrl+I)"
          >
            <Icon src={FormatItalic} />
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={formatUnderline}
            title="Gạch chân (Ctrl+U)"
          >
            <Icon src={FormatUnderlined} />
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={formatCode}
            title="Code"
          >
            <Icon src={Code} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <div className="dropdown-group">
            <button
              type="button"
              className="format-btn dropdown-btn"
              title="Tiêu đề"
            >
              <span className="heading-text">H</span>
            </button>
            <div className="dropdown-menu">
              <button type="button" onClick={() => formatHeading(1)} className="dropdown-item">
                <span className="heading-preview h1">Heading 1</span>
              </button>
              <button type="button" onClick={() => formatHeading(2)} className="dropdown-item">
                <span className="heading-preview h2">Heading 2</span>
              </button>
              <button type="button" onClick={() => formatHeading(3)} className="dropdown-item">
                <span className="heading-preview h3">Heading 3</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            className="format-btn"
            onClick={() => formatList(false)}
            title="Danh sách"
          >
            <Icon src={FormatListBulleted} />
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={() => formatList(true)}
            title="Danh sách đánh số"
          >
            <Icon src={FormatListNumbered} />
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={formatQuote}
            title="Trích dẫn"
          >
            <Icon src={FormatQuote} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            type="button"
            className="format-btn"
            onClick={insertLink}
            title="Chèn liên kết"
          >
            <Icon src={Link} />
          </button>
          <button
            type="button"
            className="format-btn"
            onClick={insertImage}
            title="Chèn hình ảnh"
          >
            <Icon src={InsertPhoto} />
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
        <div
          ref={editorRef}
          className="notes-contenteditable"
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Bắt đầu ghi chú của bạn...

💡 Mẹo:
- Ghi chú được lưu tự động
- Tồn tại đến hết phiên làm việc
- Sử dụng các nút format để định dạng
- Tải xuống để lưu vĩnh viễn"
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

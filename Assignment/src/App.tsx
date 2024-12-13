import React, { useEffect, useState } from 'react';
import {
  Editor,
  EditorState,
  ContentState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
  SelectionState,
} from 'draft-js';
import 'draft-js/dist/Draft.css';

const STORAGE_KEY = 'editor-content';

const TextEditor: React.FC = () => {
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
      const content = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(content);
    }
    return EditorState.createEmpty();
  });

  const [currentLine, setCurrentLine] = useState('');

  useEffect(() => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const text = block.getText();
    setCurrentLine(text);
  }, [editorState]);

  const handleBeforeInput = (char: string): 'handled' | 'not-handled' => {
    if (char !== ' ') return 'not-handled';

    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const block = content.getBlockForKey(selection.getStartKey());
    const text = block.getText();

    let newEditorState = editorState;
    let handled: 'handled' | 'not-handled' = 'not-handled';

    if (text === '#') {
      handled = 'handled';
      const blockSelection = SelectionState.createEmpty(block.getKey()).merge({
        focusOffset: text.length,
        anchorOffset: 0,
      });
      let newContent = Modifier.removeRange(content, blockSelection, 'backward');
      newContent = Modifier.setBlockType(newContent, newContent.getSelectionAfter(), 'header-one');
      newEditorState = EditorState.push(editorState, newContent, 'change-block-type');
    } else if (text === '*') {
      handled = 'handled';
      const blockSelection = SelectionState.createEmpty(block.getKey()).merge({
        focusOffset: text.length,
        anchorOffset: 0,
      });
      let newContent = Modifier.removeRange(content, blockSelection, 'backward');
      newEditorState = EditorState.push(editorState, newContent, 'change-inline-style');
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, 'BOLD');
    } else if (text === '**') {
      handled = 'handled';
      const blockSelection = SelectionState.createEmpty(block.getKey()).merge({
        focusOffset: text.length,
        anchorOffset: 0,
      });
      let newContent = Modifier.removeRange(content, blockSelection, 'backward');
      newEditorState = EditorState.push(editorState, newContent, 'change-inline-style');
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, 'RED');
    } else if (text === '***') {
      handled = 'handled';
      const blockSelection = SelectionState.createEmpty(block.getKey()).merge({
        focusOffset: text.length,
        anchorOffset: 0,
      });
      let newContent = Modifier.removeRange(content, blockSelection, 'backward');
      newEditorState = EditorState.push(editorState, newContent, 'change-inline-style');
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, 'UNDERLINE');
    }

    if (handled === 'handled') {
      setEditorState(newEditorState);
    }

    return handled;
  };
  const handleReturn = (e: React.KeyboardEvent): 'handled' | 'not-handled' => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();
  
   
    const newContentState = Modifier.splitBlock(contentState, selectionState);
  
  
    const newBlockKey = newContentState.getKeyAfter(selectionState.getStartKey());
  
   
    const updatedContentState = Modifier.setBlockType(
      newContentState,
      new SelectionState({
        anchorKey: newBlockKey,
        focusKey: newBlockKey,
        anchorOffset: 0,
        focusOffset: 0,
        isBackward: false,
      }),
      'unstyled'
    );
  

    let newEditorState = EditorState.push(
      editorState,
      updatedContentState,
      'split-block'
    );
  
    newEditorState = EditorState.setInlineStyleOverride(
      newEditorState,
      new Set() 
    );
  
    setEditorState(
      EditorState.forceSelection(
        newEditorState,
        updatedContentState.getSelectionAfter()
      )
    );
  
    return 'handled';
  };
  
  
  
  
  const handleSave = () => {
    const content = editorState.getCurrentContent();
    const raw = convertToRaw(content);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    alert('Content saved successfully!');
  };

  const styleMap = {
    RED: {
      color: '#ff0000',
    },
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto', padding: '24px',  }}>
      <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><p>Demo Editor by Fariq Farooq</p> <button
          onClick={handleSave}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3b82f6')}
        >
          Save
        </button></div>
        
        <div
          style={{
            minHeight: '300px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            cursor: 'text',
          }}
          onClick={() => {
            (document.querySelector('.DraftEditor-root') as HTMLElement)?.focus();
          }}
        >
          <Editor
            editorState={editorState}
            onChange={setEditorState}
            handleBeforeInput={handleBeforeInput}
            customStyleMap={styleMap}
            handleReturn={handleReturn}
          />
        </div>
       
      </div>
    </div>
  );
};

export default TextEditor;

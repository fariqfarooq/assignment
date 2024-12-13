import React, { useEffect, useRef, useState } from "react";
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw } from "draft-js";

// Custom key binding function to handle special characters
const keyBindingFn = (e, editorState) => {
  if (e.key === " " || e.key === "Enter") { // Handle space and enter key
    const contentState = editorState.getCurrentContent();
    const selection = editorState.getSelection();
    const startKey = selection.getStartKey();
    const block = contentState.getBlockForKey(startKey);
    const text = block.getText();

    if (text.startsWith("# ")) {
      return "heading";
    } else if (text.startsWith("* ")) {
      return "bold";
    } else if (text.startsWith("** ")) {
      return "red";
    } else if (text.startsWith("*** ")) {
      return "underline";
    }
  }
  return "not-handled"; // Default key binding handling
};

const DraftEditor = () => {
  const [editorState, setEditorState] = useState(
    EditorState.createWithContent(
      convertFromRaw({
        blocks: [
          {
            key: "3eesq",
            text: "",
            type: "unstyled",
            depth: 0,
            inlineStyleRanges: [
              { offset: 19, length: 6, style: "BOLD" },
              { offset: 25, length: 5, style: "ITALIC" },
              { offset: 30, length: 8, style: "UNDERLINE" },
            ],
            entityRanges: [],
            data: {},
          },
          {
            key: "9adb5",
            text: "",
            type: "header-one",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [],
            data: {},
          },
        ],
        entityMap: {},
      })
    )
  );

  const editor = useRef(null);

  // Load the editor state from localStorage on page load
  useEffect(() => {
    const savedState = localStorage.getItem("editorState");
    if (savedState) {
      setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(savedState))));
    }
    focusEditor();
  }, []);

  const focusEditor = () => {
    editor.current.focus();
  };

  // Handle special commands (heading, bold, red, underline)
  const handleKeyCommand = (command) => {
    if (command === "heading") {
      return applyHeading();
    } else if (command === "bold") {
      return toggleBold();
    } else if (command === "red") {
      return applyRed();
    } else if (command === "underline") {
      return toggleUnderline();
    }
    return "not-handled";
  };

  const applyHeading = () => {
    const newState = RichUtils.toggleBlockType(editorState, "header-one");
    setEditorState(newState);
    return "handled";
  };

  const toggleBold = () => {
    const newState = RichUtils.toggleInlineStyle(editorState, "BOLD");
    setEditorState(newState);
    return "handled";
  };

  const applyRed = () => {
    const selection = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const newContentState = Modifier.applyInlineStyle(contentState, selection, "RED");
    const newState = EditorState.push(editorState, newContentState, "change-inline-style");
    setEditorState(newState);
    return "handled";
  };

  const toggleUnderline = () => {
    const newState = RichUtils.toggleInlineStyle(editorState, "UNDERLINE");
    setEditorState(newState);
    return "handled";
  };

  // Save the editor content to localStorage
  const saveContent = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = convertToRaw(contentState);
    localStorage.setItem("editorState", JSON.stringify(rawContent));
  };

  // Custom inline styles
  const styleMap = {
    CODE: {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
      fontSize: 16,
      padding: 2,
    },
    HIGHLIGHT: {
      backgroundColor: "#F7A5F7",
    },
    RED: {
      color: "red", // Red inline style for `**` text
    },
    UPPERCASE: {
      textTransform: "uppercase",
    },
    LOWERCASE: {
      textTransform: "lowercase",
    },
    CODEBLOCK: {
      fontFamily: '"fira-code", "monospace"',
      fontSize: "inherit",
      background: "#ffeff0",
      fontStyle: "italic",
      lineHeight: 1.5,
      padding: "0.3rem 0.5rem",
      borderRadius: " 0.2rem",
    },
    SUPERSCRIPT: {
      verticalAlign: "super",
      fontSize: "80%",
    },
    SUBSCRIPT: {
      verticalAlign: "sub",
      fontSize: "80%",
    },
  };

  // For block level styles (returns CSS Class from DraftEditor.css)
  const myBlockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    switch (type) {
      case "blockQuote":
        return "superFancyBlockquote";
      case "leftAlign":
        return "leftAlign";
      case "rightAlign":
        return "rightAlign";
      case "centerAlign":
        return "centerAlign";
      case "justifyAlign":
        return "justifyAlign";
      default:
        break;
    }
  };

  return (
    <div className="editor-container">
      <h1>Draft.js Editor</h1>
      <button onClick={saveContent}>Save</button>
      <div>
        <Editor
          ref={editor}
          placeholder="Write Here..."
          handleKeyCommand={handleKeyCommand}
          editorState={editorState}
          customStyleMap={styleMap}
          blockStyleFn={myBlockStyleFn}
          onChange={(editorState) => {
            const contentState = editorState.getCurrentContent();
            setEditorState(editorState);
          }}
          keyBindingFn={(e) => keyBindingFn(e, editorState)}
        />
      </div>
    </div>
  );
};

export default DraftEditor;

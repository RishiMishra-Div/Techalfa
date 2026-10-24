import { useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

const emptyDocument = { type: "doc", content: [{ type: "paragraph" }] };

export default function ContentEditor({ value, onChange, onUpload }) {
  const fileInput = useRef(null);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false, inline: false }),
      Youtube.configure({ controls: true, nocookie: true, width: 720, height: 405 }),
    ],
    content: value?.type === "doc" ? value : emptyDocument,
    onUpdate: ({ editor: current }) => onChange(current.getJSON()),
  });

  async function addImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor) return;
    try {
      const url = await onUpload(file);
      editor.chain().focus().setImage({ src: url, alt: file.name }).run();
    } catch (error) {
      window.alert(error.message || "The image could not be uploaded.");
    }
  }

  function addVideo() {
    const url = window.prompt("Paste a YouTube video link");
    if (url) editor?.chain().focus().setYoutubeVideo({ src: url }).run();
  }

  if (!editor) return <div className="content-editor-loading">Loading content editor…</div>;

  return <div className="content-editor">
    <div className="content-toolbar" role="toolbar" aria-label="Article formatting">
      <button type="button" className={editor.isActive("bold") ? "active" : ""} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
      <button type="button" className={editor.isActive("italic") ? "active" : ""} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
      <button type="button" className={editor.isActive("heading", { level: 2 }) ? "active" : ""} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
      <button type="button" className={editor.isActive("heading", { level: 3 }) ? "active" : ""} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
      <button type="button" className={editor.isActive("bulletList") ? "active" : ""} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
      <button type="button" className={editor.isActive("orderedList") ? "active" : ""} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
      <button type="button" className={editor.isActive("blockquote") ? "active" : ""} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>
      <button type="button" onClick={() => fileInput.current?.click()}>Add image</button>
      <button type="button" onClick={addVideo}>Embed video</button>
      <input ref={fileInput} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={addImage} />
    </div>
    <EditorContent editor={editor} className="content-editable" />
    <small className="admin-help">Write and format the page, add uploaded images, or embed a YouTube video. Changes are saved with the record.</small>
  </div>;
}

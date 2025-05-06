'use client'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Color } from '@tiptap/extension-color'
import Underline from '@tiptap/extension-underline'
import { useState, useRef, useEffect } from 'react'
import { List, ListChecks, ListOrdered, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline as UnderlinedIcon, Strikethrough, ChevronDown, Code } from 'lucide-react'

const Tiptap = () => {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const systemColors = [
        ['#FFFFFF', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D'],
        ['#FFEB3B', '#FFA726', '#FF4444', '#E040FB', '#2196F3', '#00E676'],
        ['#FFD600', '#FB8C00', '#D50000', '#D500F9', '#1976D2', '#00C853'],
        ['#FFC107', '#F57C00', '#B71C1C', '#AA00FF', '#0D47A1', '#1B5E20'],
    ]
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4]
                }
            }),
            TextStyle.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        fontSize: {
                            default: null,
                            parseHTML: (element) => element.style.fontSize.replace('px', ''),
                            renderHTML: (attributes) => {
                                if (!attributes['fontSize']) {
                                    return {};
                                }
                                return {
                                    style: `font-size: ${attributes['fontSize']}px`
                                };
                            }
                        }
                    };
                },
                addCommands() {
                    return {
                        ...this.parent?.(),
                        setFontSize:
                            (fontSize: string) =>
                                ({ commands }: { commands: any }) => {
                                    return commands.setMark(this.name, { fontSize: fontSize });
                                },
                        unsetFontSize:
                            () =>
                                ({ chain }: { chain: any }) => {
                                    return chain()
                                        .setMark(this.name, { fontSize: null })
                                        .removeEmptyTextStyle()
                                        .run();
                                }
                    }
                }
            }),
            Underline,

            Color,
            TextAlign.configure({
                types: ['heading', 'paragraph', 'small'],
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: `
       <p>The rapid advancement of <span style="color: #00E676">technology</span> continues to reshape our world, with 2024 poised to be a pivotal year for groundbreaking innovations. From the continued evolution of artificial intelligence to the revolutionary potential of quantum computing, the tech <span style="color: #FFA726">landscape</span> is primed for <span style="color: #AA00FF">transformative</span> breakthroughs that will profoundly impact our daily lives.</p>
        `,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none max-w-none prose-headings:margin-0',
            }
        },
        immediatelyRender: false,
    })

    if (!editor) {
        return null
    }

    const ColorPickerButton = () => {
        const colorPickerRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                    setShowColorPicker(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        return (
            <div className="relative" ref={colorPickerRef}>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        setShowColorPicker(!showColorPicker);

                    }}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50"
                >
                    <p className='flex flex-col items-center'>
                        <span className="text-base">A</span>
                        <span className="w-4 h-1 rounded" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}></span>
                    </p>
                    <span><ChevronDown className="h-4 w-4" /></span>
                </button>

                {showColorPicker && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border p-3 z-50">

                        <div className="mb-2">
                            <span className="text-sm font-medium">System colors</span>
                        </div>
                        <div className="grid gap-1">
                            {systemColors.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex gap-1 ">
                                    {row.map((color) => (
                                        <button
                                            key={color}
                                            className="w-8 h-8 rounded relative"
                                            style={{ backgroundColor: color }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                editor.chain().focus().setColor(color).run();

                                                setShowColorPicker(false);
                                            }}
                                        >
                                            {editor.getAttributes('textStyle').color === color && (
                                                <span className="absolute inset-0 flex items-center justify-center text-white text-lg">
                                                    ✓
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            ))}


                            <button
                                className="w-full text-sm text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1 mt-2"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    editor.chain().focus().unsetColor().run();

                                    setShowColorPicker(false);
                                }}
                            >
                                <span>↺</span> Reset to default
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const ListAlignmentMenu = () => (
        <div className="flex items-center gap-2">
            <div className="flex gap-1">
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleBulletList().run();
                    }}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleOrderedList().run();
                    }}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
                <button
                    onMouseDown={(e) => {
                        e.preventDefault();
                        editor.chain().focus().toggleTaskList().run();
                    }}
                    className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('taskList') ? 'bg-gray-200' : ''}`}
                    title="Task List"
                >
                    <ListChecks className="h-4 w-4" />
                </button>
            </div>

            <div className="relative group border-l pl-2">
                <button
                    className="p-2 rounded hover:bg-gray-100"
                    title="Text Alignment"
                >
                    <AlignLeft className="h-4 w-4" />
                </button>
                <div className="absolute hidden group-hover:block top-full right-0 bg-white border rounded-lg shadow-lg p-1 z-50 min-w-[160px]">
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-100' : ''}`}
                    >
                        <AlignLeft className="h-4 w-4" />
                        Left
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-100' : ''}`}
                    >
                        <AlignCenter className="h-4 w-4" />
                        Center
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-100' : ''}`}
                    >
                        <AlignRight className="h-4 w-4" />
                        Right
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} >
                <div className="flex w-full gap-2 bg-white border shadow-lg p-2 rounded-lg">
                    <div className="flex gap-1 border-r pr-2">
                        <select
                            className='bg-transparent focus-visible:outline-none'
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === 'paragraph') {
                                    editor.chain().focus().setParagraph().run();
                                } else if (value.startsWith('heading-')) {
                                    const level = parseInt(value.split('-')[1]) as 1 | 2 | 3 | 4;
                                    editor.chain().focus().setHeading({ level }).run();
                                } else if (value === 'small') {

                                }
                            }}
                            value="small"
                        >
                            <option value="small">Small</option>
                            <option value="paragraph">Normal</option>
                            <option value="heading-4">Heading 4</option>
                            <option value="heading-3">Heading 3</option>
                            <option value="heading-2">Heading 2</option>
                            <option value="heading-1">Heading 1</option>
                        </select>
                    </div>

                    <div className="flex gap-1 border-r pr-2">
                        <ColorPickerButton />
                    </div>

                    <div className="flex gap-1 border-r pr-2">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
                        >
                            <Bold className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
                        >
                            <Italic className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
                        >
                            <UnderlinedIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleStrike().run()}
                            className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-gray-200' : ''}`}
                        >
                            <Strikethrough className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleCode().run()}
                            className={`p-1 rounded hover:bg-gray-100 ${editor.isActive('codeBlock') ? 'bg-gray-200' : ''}`}
                        >
                            <Code className="h-4 w-4" />
                        </button>
                    </div>

                    <ListAlignmentMenu />
                </div>
            </BubbleMenu>
            <EditorContent editor={editor} />
            <button onClick={() => console.log(editor.getHTML())}>get Markdown</button>
        </>
    )
}

export default Tiptap;



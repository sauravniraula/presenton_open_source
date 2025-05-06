import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Upload, Wand2, X } from 'lucide-react'

interface GeneratorFormProps {
    prompt: string;
    uploadedFile: File | null;
    isGenerating: boolean;
    onPromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onGenerate: () => void;
    setUploadedFile: (file: File | null) => void;
}

export function GeneratorForm({
    prompt,
    uploadedFile,
    isGenerating,
    onPromptChange,
    onFileUpload,
    onGenerate,
    setUploadedFile
}: GeneratorFormProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium">Presentation Description</label>
                <Textarea
                    placeholder="Describe your presentation content and style..."
                    className="min-h-[150px] resize-none"
                    value={prompt}
                    onChange={onPromptChange}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Supporting Document (Optional)</label>
                <div className="border-2 relative border-dashed border-gray-200 rounded-lg p-6 text-center">
                    {uploadedFile && <Button className="absolute top-2 right-2" variant="ghost" onClick={() => setUploadedFile(null)}>
                        <X className="w-4 h-4" />
                    </Button>}
                    <Input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={onFileUpload}
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                    >
                        <Upload className="w-8 h-8 text-gray-400" />
                        {uploadedFile ? (
                            <span className="text-sm text-gray-600">{uploadedFile.name}</span>
                        ) : (
                            <>
                                <span className="text-sm text-gray-600">
                                    Drop your document here or click to upload
                                </span>
                                <span className="text-xs text-gray-400">
                                    Supports PDF, DOC, DOCX
                                </span>
                            </>
                        )}
                    </label>
                </div>
            </div>

            <Button
                className="w-full"
                onClick={onGenerate}
                disabled={isGenerating}
            >
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Presentation'}
            </Button>
        </div>
    );
} 
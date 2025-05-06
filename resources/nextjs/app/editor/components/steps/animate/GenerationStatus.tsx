import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, AlertCircle, Settings2 } from "lucide-react";

export interface AnimationState {
    status: 'idle' | 'generating' | 'complete' | 'error';
    message: string;
    subMessage: string;
    progress: number;
}

interface GenerationStatusProps {
    animationState: AnimationState;
}

export default function GenerationStatus({ animationState }: GenerationStatusProps) {
    return (
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Generation Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        {animationState.status === 'generating' && (
                            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                            </div>
                        )}
                        {animationState.status === 'complete' && (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                        )}
                        {animationState.status === 'error' && (
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                        )}
                        {animationState.status === 'idle' && (
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <Settings2 className="h-5 w-5 text-gray-600" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{animationState.message}</h4>
                            <p className="text-sm text-gray-500">{animationState.subMessage}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium text-gray-900">
                                {Math.round(animationState.progress)}%
                            </span>
                        </div>
                        <Progress value={animationState.progress} className="h-2" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

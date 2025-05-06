import { createSlice, PayloadAction } from '@reduxjs/toolkit';



interface ProgressStepsState {
    currentStep: number;
    completedSteps: number[];
    isProcessing: boolean;
}

const initialState: ProgressStepsState = {
    currentStep: 1,
    completedSteps: [],
    isProcessing: false,
};

const progressStepsSlice = createSlice({
    name: 'progressSteps',
    initialState,
    reducers: {
        setCurrentStep: (state, action: PayloadAction<number>) => {
            state.currentStep = action.payload;
        },
        completeStep: (state, action: PayloadAction<number>) => {
            if (!state.completedSteps.includes(action.payload)) {
                state.completedSteps.push(action.payload);
            }
        },
        setProcessing: (state, action: PayloadAction<boolean>) => {
            state.isProcessing = action.payload;
        },
        resetSteps: (state) => {
            state.currentStep = 1;
            state.completedSteps = [];
            state.isProcessing = false;
        },
    },
});

export const { setCurrentStep, completeStep, setProcessing, resetSteps } = progressStepsSlice.actions;
export default progressStepsSlice.reducer;

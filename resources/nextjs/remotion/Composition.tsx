'use client';

import React, { forwardRef, useEffect, useState } from "react";
import { AbsoluteFill, useVideoConfig, Audio } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { slide as slideTransition } from "@remotion/transitions/slide";
import { linearTiming } from "@remotion/transitions";
import { SubtitleSequence, FadeCaption as Caption } from "../remotion-subtitle";
import { useFontLoader } from "./hooks/useFontLoader";
import Slide from "./components/Slide";
import { SlideData } from "./types/slideTypes";
import { loadFont } from "@remotion/google-fonts/Inter";

// Load Inter font
const { fontFamily } = loadFont();

const SLIDE_PADDING_SECONDS = 1;
const AVATAR_SIZE = 400;
const AVATAR_PADDING = 0;
const VIDEO_TIMEOUT = 60000; // 60 seconds timeout for video loading
const TRANSITION_DURATION_FRAMES = 15; // 500ms at 30fps

interface MainProps {
	slides: SlideData[];
	currentSlideIndex?: number;
	slideFrameMappings: Array<{
		startFrame: number;
		endFrame: number;
		duration: number;
		audioDuration: number;
	}>;
	showSubtitles?: boolean;
}

interface SubtitleData {
	startTime: number;
	endTime: number;
	text: string;
}

export const Main = forwardRef<HTMLDivElement, MainProps>(({ slides, currentSlideIndex, slideFrameMappings, showSubtitles }, ref) => {
	const { fps } = useVideoConfig();
	const { fontsLoaded } = useFontLoader(slides);
	const [sequences, setSequences] = useState<React.ReactNode[]>([]);
	const [subtitlesLoaded, setSubtitlesLoaded] = useState(false);

	useEffect(() => {
		const loadSubtitles = async () => {
			if (!slides[0]?.merged_subtitle_url) return;

			try {
				console.log("Loading subtitles", slides[0].merged_subtitle_url);
				const subtitles = new SubtitleSequence(slides[0].merged_subtitle_url);
				await subtitles.ready();
				const subtitleSequences = subtitles.getSequences(
					<Caption 
						style={{
							fontSize: 15,
							fontFamily,
							fontWeight: 500,
							textAlign: 'center',
							color: 'white',
							textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
							backgroundColor: 'rgba(0,0,0,0.5)',
							padding: '8px 16px',
							borderRadius: '4px',
							maxWidth: '80%',
							margin: '0 auto'
						}}
					/>, 
					fps
				);
				setSequences(subtitleSequences);
				setSubtitlesLoaded(true);
				console.log("Subtitles loaded", subtitleSequences);

			} catch (error) {
				console.error('Error loading subtitles:', error);
			}
		};

		loadSubtitles();
	}, [slides, fps]);

	if (!slides?.length) {
		return <AbsoluteFill style={{ backgroundColor: 'white' }}><h1>No slides provided</h1></AbsoluteFill>;
	}

	if (!slideFrameMappings?.length) {
		return <AbsoluteFill style={{ backgroundColor: 'white' }}><h1>No slide mappings provided</h1></AbsoluteFill>;
	}

	if (!fontsLoaded) {
		return <AbsoluteFill style={{ backgroundColor: 'white' }}><h1>Loading fonts...</h1></AbsoluteFill>;
	}

	return (
		<div ref={ref}>
			<AbsoluteFill>
				{slides[0]?.merged_audio_url && !slides[0]?.video_url && (
					<Audio
						src={slides[0].merged_audio_url}
						volume={1}
					/>
				)}

				<TransitionSeries>
					{slides.map((slide, index) => {
						const mapping = slideFrameMappings[index];

						if (!mapping) {
							console.warn(`No mapping found for slide ${index}`);
							return null;
						}
	
						return (
							<React.Fragment key={`slide-${index}`}>
								<TransitionSeries.Sequence
									durationInFrames={Math.ceil(mapping.duration * fps)}
									name={`Slide ${index + 1}`}
								>
									<AbsoluteFill style={{
										width: slide.frame_size.width,
										height: slide.frame_size.height
									}}>
										<Slide slideData={slide} />
									</AbsoluteFill>
								</TransitionSeries.Sequence>
								
								{index < slides.length - 1 && (
									<TransitionSeries.Transition
										presentation={slideTransition()}
										timing={springTiming({
											durationInFrames: TRANSITION_DURATION_FRAMES,
											config: {
												damping: 16,
												mass: 3,
												stiffness: 30,
											}
										})}
									/>
								)}
							</React.Fragment>
						);
					})}
				</TransitionSeries>

				{subtitlesLoaded && showSubtitles && (
					<div>
						{sequences}
					</div>
				)}

				{slides[0]?.video_url && (
					<div style={{
						position: 'absolute',
						bottom: AVATAR_PADDING,
						right: AVATAR_PADDING,
						width: AVATAR_SIZE,
						height: AVATAR_SIZE,
						borderRadius: '16px',
						overflow: 'hidden',
						backgroundColor: 'transparent'
					}}>
						<video
							src={slides[0].video_url}
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover'
							}}
						/>
					</div>
				)}
			</AbsoluteFill>
		</div>
	);
});

Main.displayName = 'Main';
"use client";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Palette,
  SquareArrowOutUpRight,
  Play,
  Loader2,
  Copy,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Wrapper from "@/components/Wrapper";
import { usePathname, useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UserAccount from "../../components/UserAccount";
import { PresentationGenerationApi } from "../../services/api/presentation-generation";
import { OverlayLoader } from "@/components/ui/overlay-loader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";

import Link from "next/link";

import { ThemeType } from "@/app/(presentation-generator)/upload/type";
import {
  setTheme,
  setThemeColors,
  defaultColors,
  serverColors,
} from "../../store/themeSlice";
import CustomThemeSettings from "../../components/CustomThemeSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RootState } from "@/store/store";
import { toast } from "@/hooks/use-toast";

import ThemeSelector from "./ThemeSelector";
import Modal from "./Modal";

import Announcement from "@/components/Announcement";

const Header = ({
  presentation_id,
  currentSlide,
}: {
  presentation_id: string;
  currentSlide?: number;
}) => {
  const [open, setOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [showCustomThemeModal, setShowCustomThemeModal] = useState(false);
  const { currentTheme, currentColors } = useSelector(
    (state: RootState) => state.theme
  );
  const { presentationData, isStreaming } = useSelector(
    (state: RootState) => state.presentationGeneration
  );
  const dispatch = useDispatch();
  const handleThemeSelect = async (value: string) => {
    if (isStreaming) return;
    if (value === "custom") {
      setShowCustomThemeModal(true);
      return;
    } else {
      const themeType = value as ThemeType;
      const themeColors = serverColors[themeType] || defaultColors[themeType];

      if (themeColors) {
        try {
          // Update UI
          dispatch(setTheme(themeType));
          dispatch(setThemeColors({ ...themeColors, theme: themeType }));
          // Set CSS variables
          const root = document.documentElement;
          root.style.setProperty(
            `--${themeType}-slide-bg`,
            themeColors.slideBg
          );
          root.style.setProperty(
            `--${themeType}-slide-title`,
            themeColors.slideTitle
          );
          root.style.setProperty(
            `--${themeType}-slide-heading`,
            themeColors.slideHeading
          );
          root.style.setProperty(
            `--${themeType}-slide-description`,
            themeColors.slideDescription
          );
          root.style.setProperty(
            `--${themeType}-slide-box`,
            themeColors.slideBox
          );

          // Save in background
          await PresentationGenerationApi.setThemeColors(presentation_id, {
            name: themeType,
            colors: {
              ...themeColors,
            },
          });
        } catch (error) {
          console.error("Failed to update theme:", error);
          toast({
            title: "Error updating theme",
            description:
              "Failed to update the presentation theme. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const getSlideMetadata = async () => {
    const path = pathname.split("/")[2];
    try {
      const response = await fetch(
        "https://ebc3a3r5lslzhvm6wau45bx7yu0abugw.lambda-url.ap-south-1.on.aws/",
        {
          // const response = await fetch('http://localhost:3001/api/generate-metadata', {
          method: "POST",
          // headers: {
          //     'Content-Type': 'application/json'
          // },
          body: JSON.stringify({
            url: `https://presenton.ai/presentation/${path}`,
            theme: currentTheme,
            customColors: currentColors,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch metadata");
      }
      const metadata = await response.json();

      return metadata;
    } catch (error) {
      setShowLoader(false);
      console.error("Error fetching metadata:", error);
      // You might want to show an error toast/notification here
      throw error;
    }
  };
  const metaData = async () => {
    const body = {
      user_id: "user?.id!",
      presentation_id: presentation_id,
      slides: presentationData?.slides,
    };
    await PresentationGenerationApi.updatePresentationContent(body)
      .then(() => {})
      .catch((error) => {
        console.error(error);
      });

    const metadata = await getSlideMetadata();

    // const metadata = collectSlideMetadata();

    const slides = metadata.map((slide: any, index: any) => {
      return {
        shapes: slide.elements,
      };
    });

    const apiBody = {
      user_id: "user?.id",
      presentation_id: presentation_id,
      pptx_model: {
        background_color: metadata[0].backgroundColor,

        slides: slides,
      },
    };

    return apiBody;
  };
  const handleExportPptx = async () => {
    if (isStreaming) return;

    try {
      setOpen(false);
      setShowLoader(true);

      const apiBody = await metaData();

      const response = await PresentationGenerationApi.exportAsPPTX(apiBody);
      if (response.url) {
        downloadLink(response.url);
      } else {
        throw new Error("No URL returned from export");
      }
    } catch (error) {
      console.error("Export failed:", error);
      setShowLoader(false);
      toast({
        title: "Having trouble exporting!",
        description:
          "We are having trouble exporting your presentation. Please try again.",
        variant: "default",
      });
    } finally {
      setShowLoader(false);
    }
  };
  const downloadLink = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    // Append to document, trigger click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleExportPdf = async () => {
    if (isStreaming) return;

    try {
      setOpen(false);
      setShowLoader(true);
      const apiBody = await metaData();

      const data = await PresentationGenerationApi.exportAsPDF(apiBody);

      if (data.url) {
        downloadLink(data.url);
      }
      setShowLoader(false);
    } catch (err) {
      console.error(err);
      setShowLoader(false);
      toast({
        title: "Having trouble exporting!",
        description:
          "We are having trouble exporting your presentation. Please try again.",
        variant: "default",
      });
    }
  };

  const ExportOptions = () => (
    <div className="space-y-2 max-md:mt-4 bg-white rounded-lg p-2">
      <Button
        onClick={handleExportPdf}
        variant="ghost"
        className="pb-4 border-b rounded-none border-gray-300 w-full flex justify-start text-[#5146E5]"
      >
        <Image
          src="/generator/pdf.svg"
          alt="pdf export"
          width={30}
          height={30}
        />
        Export as PDF
      </Button>
      <Button
        onClick={handleExportPptx}
        variant="ghost"
        className="w-full flex justify-start text-[#5146E5]"
      >
        <Image
          src="/generator/pptx.svg"
          alt="pptx export"
          width={30}
          height={30}
        />
        Export as PPTX
      </Button>
    </div>
  );

  const MenuItems = () => (
    <div className="flex flex-col lg:flex-row items-center gap-4">
      {/* Present Button */}
      {/* <Button
                onClick={() => router.push(`?mode=present&slide=${currentSlide || 0}`)}
                variant='ghost'
                className='border border-white font-bold text-white rounded-[32px] transition-all duration-300 group'
            >
                <Play className='w-4 h-4 mr-1 stroke-white group-hover:stroke-black' />
                Present
            </Button> */}

      {/* Desktop Export Button with Popover */}

      <div className="hidden lg:block">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button className="bg-white border py-5 text-[#5146E5] font-bold rounded-[32px] transition-all duration-500 hover:border hover:bg-[#5146E5] hover:text-white w-full">
              <SquareArrowOutUpRight className="w-4 h-4 mr-1" />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[250px] space-y-2 py-3 px-2">
            <ExportOptions />
          </PopoverContent>
        </Popover>
      </div>

      {/* Mobile Export Section */}
      <div className="lg:hidden flex flex-col w-full">
        <ExportOptions />
      </div>
    </div>
  );
  const copyToClipBoard = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied to clipboard",
    });
  };

  return (
    <div className="bg-[#5146E5] w-full shadow-lg sticky top-0 z-50">
      <OverlayLoader
        show={showLoader}
        text="Exporting presentation..."
        showProgress={true}
        duration={40}
      />
      <Announcement />
      <Wrapper className="flex items-center justify-between py-2">
        <Link href="/" className="min-w-[162px]">
          <Image
            src="/logo-white.png"
            alt="Presentation logo"
            width={162}
            height={32}
            priority
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4 2xl:gap-6">
          {/* <p className='text-white text-sm font-neue-montreal font-medium'>
                        {presentation?.title}
                    </p> */}

          {/* Theme Dropdown */}
          {isStreaming && (
            <Loader2 className="animate-spin text-white font-bold w-6 h-6" />
          )}

          <Select value={currentTheme} onValueChange={handleThemeSelect}>
            <SelectTrigger className="w-[160px] bg-[#6358fd] text-white border-none hover:bg-[#5146E5] transition-colors">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span>Change Theme</span>
              </div>
            </SelectTrigger>
            <SelectContent className="w-[300px] p-0">
              <ThemeSelector
                onSelect={handleThemeSelect}
                selectedTheme={currentTheme}
              />
            </SelectContent>
          </Select>

          {/* Custom Theme Modal */}
          <Modal
            isOpen={showCustomThemeModal}
            onClose={() => setShowCustomThemeModal(false)}
            title="Custom Theme Colors"
          >
            <CustomThemeSettings
              onClose={() => setShowCustomThemeModal(false)}
              presentationId={presentation_id}
            />
          </Modal>

          <button
            onClick={copyToClipBoard}
            className="flex items-center gap-2 text-white bg-[#6558fd] hover:bg-[#6558fd]/50 px-4 py-2 rounded-lg text-sm font-neue-montreal font-medium"
          >
            <Copy className="w-4 h-4" /> Share
          </button>
          <MenuItems />
        </div>

        {/* Mobile Menu */}
        <div className="lg:hidden flex items-center gap-4">
          <UserAccount showName={false} />
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-white">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#5146E5] border-none p-4">
              <div className="flex flex-col gap-6 mt-10">
                {/* <Input
                                    className='text-white border-none focus-visible:ring-white px-4 py-2 rounded-[32px] text-base font-neue-montreal font-medium'
                                    value={presentation?.title}

                                    readOnly
                                /> */}

                <a
                  href="/contact"
                  className="text-white text-center bg-[#6558fd] hover:bg-[#6558fd]/50 px-4 py-2 rounded-lg text-sm font-neue-montreal font-medium"
                >
                  Send Feedback
                </a>

                <button
                  onClick={copyToClipBoard}
                  className="flex items-center gap-2 justify-center text-white bg-[#6558fd] hover:bg-[#6558fd]/50 px-4 py-2 rounded-lg text-sm font-neue-montreal font-medium"
                >
                  <Copy className="w-4 h-4" /> Share
                </button>
                <Select onValueChange={handleThemeSelect}>
                  <SelectTrigger className="w-full bg-[#6358fd] flex justify-center gap-2 text-white border-none">
                    <Palette className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Theme</SelectItem>
                    <SelectItem value="dark">Dark Theme</SelectItem>
                    <SelectItem value="royal_blue">Royal Blue Theme</SelectItem>
                    <SelectItem value="cream">Cream Theme</SelectItem>
                    <SelectItem value="dark_pink">Dark Pink Theme</SelectItem>
                    <SelectItem value="light_red">Light Red Theme</SelectItem>
                    <SelectItem value="faint_yellow">
                      Faint Yellow Theme
                    </SelectItem>
                    <SelectItem value="custom">Custom Theme</SelectItem>
                  </SelectContent>
                </Select>
                <MenuItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Wrapper>
    </div>
  );
};

export default Header;

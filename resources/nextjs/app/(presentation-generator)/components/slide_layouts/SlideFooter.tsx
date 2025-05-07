import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import React, { useRef, useState } from "react";

import { Camera, Loader2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { isDarkColor } from "../../utils/others";
import { useFooter } from "../../context/footerContext";

const SlideFooter: React.FC = () => {
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState({
    white: false,
    dark: false,
  });
  const { currentColors } = useSelector((state: RootState) => state.theme);
  const isDark = isDarkColor(currentColors.slideBg);

  const whiteLogoRef = useRef<HTMLInputElement | null>(null);
  const darkLogoRef = useRef<HTMLInputElement | null>(null);
  const {
    footerProperties,
    setFooterProperties,
    saveFooterProperties,
    status,
  } = useFooter();

  // Handler for updating nested state properties
  const updateProperty = (path: string, value: any): void => {
    const keys = path.split(".");
    setFooterProperties((prevProps: any) => {
      const newProps = { ...prevProps };
      let current: any = newProps;

      // Navigate to the correct nested object except for the last key
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      // Set the value for the last key
      current[keys[keys.length - 1]] = value;

      return newProps;
    });
  };

  const handleSave = () => {
    saveFooterProperties(footerProperties);
    toast({
      title: "Footer properties saved successfully",
    });
  };

  const handleReset = () => {
    const defaultFooterProperties = {
      logoProperties: {
        showLogo: true,
        logoPosition: "left",
        opacity: 0.8,
        logoImage: {
          light: footerProperties.logoProperties.logoImage.light,
          dark: footerProperties.logoProperties.logoImage.dark,
        },
      },
      logoScale: 1.0,
      logoOffset: {
        x: 1,
        y: 1,
      },
      footerMessage: {
        showMessage: true,
        fontSize: 12,
        opacity: 0.8,
        message: footerProperties.footerMessage.message,
      },
    };
    setFooterProperties(defaultFooterProperties);
  };

  // Helper for checkbox inputs
  const handleSwitchChange =
    (path: string) =>
    (checked: boolean): void => {
      updateProperty(path, checked);
    };

  // Helper for text inputs
  const handleTextChange =
    (path: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      updateProperty(path, e.target.value);
    };

  // Helper for select inputs
  const handleSelectChange =
    (path: string) =>
    (value: string): void => {
      updateProperty(path, value);
    };

  // Helper for slider inputs
  const handleSliderChange =
    (path: string) =>
    (value: number[]): void => {
      updateProperty(path, value[0]);
    };

  // Get logo based on position
  const getLogoPositionClass = (): string => {
    const { logoPosition } = footerProperties.logoProperties;
    return logoPosition === "left"
      ? "justify-start"
      : logoPosition === "center"
      ? "justify-center"
      : "justify-end";
  };

  // Calculate logo styles
  const getLogoStyle = (): React.CSSProperties => {
    const { opacity } = footerProperties.logoProperties;
    const { logoScale, logoOffset } = footerProperties;
    return {
      opacity: opacity,
      transform: `scale(${logoScale}) translate(${logoOffset.x}px, ${logoOffset.y}px)`,
    };
  };

  // Calculate message styles
  const getMessageStyle = (): React.CSSProperties => {
    const { fontSize, opacity } = footerProperties.footerMessage;
    return {
      opacity: opacity,
      fontSize: `${fontSize}px`,
    };
  };

  // Get the appropriate logo image URL
  const getLogoImageSrc = (): string => {
    if (isDark) {
      return footerProperties.logoProperties.logoImage.dark;
    } else {
      return footerProperties.logoProperties.logoImage.light;
    }
  };

  const handleEditor = () => {
    setShowEditor(!showEditor);

    return;
  };

  const handleWhiteLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Check file type
    if (!file.type.startsWith("image/")) {
      const error_message = "Please upload an image file";
      toast({
        title: "Please Upload An Image File",
      });
      return;
    }
    try {
      setIsUploading({
        ...isUploading,
        white: true,
      });
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/user-public-upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const data = await response.json();
      setFooterProperties((prev) => ({
        ...prev,
        logoProperties: {
          ...prev.logoProperties,
          logoImage: {
            ...prev.logoProperties.logoImage,
            light: data.url,
          },
        },
      }));
    } catch (err) {
      const error_message = "Failed to upload image. Please try again.";
    } finally {
      setIsUploading({
        ...isUploading,
        white: false,
      });
    }
  };

  const handleDarkLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Check file type
    if (!file.type.startsWith("image/")) {
      const error_message = "Please upload an image file";
      toast({
        title: "Please Upload An Image File",
      });
      return;
    }
    try {
      setIsUploading({
        ...isUploading,
        dark: true,
      });
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/user-public-upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const data = await response.json();
      setFooterProperties((prev) => ({
        ...prev,
        logoProperties: {
          ...prev.logoProperties,
          logoImage: {
            ...prev.logoProperties.logoImage,
            dark: data.url,
          },
        },
      }));
    } catch (err) {
      const error_message = "Failed to upload image. Please try again.";
    } finally {
      setIsUploading({
        ...isUploading,
        dark: false,
      });
    }
  };

  const handleUploadClick = (isWhite: boolean) => {
    if (isWhite) {
      whiteLogoRef.current?.click();
    } else {
      darkLogoRef.current?.click();
    }
  };

  const handleSheetClose = () => {
    handleSave();
    setShowEditor(false);
  };

  return (
    <>
      <div
        onClick={handleEditor}
        title="Click to change footer"
        id="footer"
        className="absolute hidden lg:grid z-10 cursor-pointer px-6  grid-cols-3 items-end left-1/2 -translate-x-1/2 justify-between bottom-5 w-full"
      >
        {/* Left logo */}
        <div
          className={`h-8 flex-1 flex ${
            footerProperties.logoProperties.logoPosition === "left"
              ? getLogoPositionClass()
              : "justify-start"
          }`}
        >
          {footerProperties.logoProperties.showLogo &&
            (footerProperties.logoProperties.logoPosition === "left" ? (
              getLogoImageSrc() !== "" ? (
                <img
                  data-slide-element
                  data-element-type="picture"
                  id="footer-user-logo"
                  className="w-auto h-full object-contain"
                  src={getLogoImageSrc()}
                  alt="logo"
                  style={getLogoStyle()}
                />
              ) : (
                <div className="flex gap-2 items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex justify-center items-center">
                    <Plus className="text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-400">Insert Your Logo</p>
                </div>
              )
            ) : (
              <div></div>
            ))}
        </div>

        {/*  Message */}
        <div
          className={`flex-1 flex items-center font-satoshi slide-title justify-center`}
        >
          <p
            id="footer-user-message"
            className="text-sm"
            data-slide-element
            data-element-type="text"
            data-text-content={footerProperties.footerMessage.message}
            style={getMessageStyle()}
          >
            {footerProperties.footerMessage.showMessage &&
              (footerProperties.footerMessage.message
                ? footerProperties.footerMessage.message
                : "Your text")}
          </p>
        </div>

        {/* watermark*/}
        <div
          className={`h-8 flex-1 flex ${
            footerProperties.logoProperties.logoPosition === "right"
              ? getLogoPositionClass()
              : "justify-start"
          }`}
        >
          {footerProperties.logoProperties.showLogo &&
          footerProperties.logoProperties.logoPosition === "right" ? (
            getLogoImageSrc() !== "" ? (
              <div data-element-type="picture" data-slide-element>
                <img
                  data-slide-element
                  data-element-type="picture"
                  id="footer-user-logo"
                  className="w-auto h-full object-contain"
                  src={getLogoImageSrc()}
                  alt="logo"
                  style={getLogoStyle()}
                />
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex justify-center items-center">
                  <Plus className="text-gray-500" />
                </div>
                <p className="text-sm text-gray-400">Insert Your Logo</p>
              </div>
            )
          ) : (
            <div className="w-full flex justify-end"></div>
          )}
        </div>
      </div>

      <Sheet open={showEditor} onOpenChange={handleSheetClose}>
        <SheetContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="sm:max-w-[500px] overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle>Configure Footer</SheetTitle>
            <p className="text-sm text-gray-500">
              These changes will apply to all slides.
            </p>
          </SheetHeader>

          {/* Logo Configuration */}
          <div className="space-y-6 h-[calc(100vh-200px)] overflow-y-auto custom_scrollbar p-4">
            <div className=" pb-8">
              <h3 className="text-lg font-medium mb-4">Logo Settings</h3>

              <div className="space-y-6 ">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showLogo" className="flex-1">
                    Show Logo
                  </Label>
                  <Switch
                    id="showLogo"
                    checked={footerProperties.logoProperties.showLogo}
                    onCheckedChange={handleSwitchChange(
                      "logoProperties.showLogo"
                    )}
                  />
                </div>
                <div className="flex w-full gap-2 items-center">
                  <div className="w-full">
                    <div
                      onClick={() => handleUploadClick(true)}
                      className="h-28 border relative overflow-hidden flex justify-center items-center cursor-pointer group group-hover:border-blue-500"
                    >
                      <input
                        ref={whiteLogoRef}
                        type="file"
                        accept="image/*"
                        id="whiteLogo"
                        name="whiteLogo"
                        onChange={handleWhiteLogoUpload}
                        className="opacity-0 z-[-10] absolute group-hover:border-blue-500 h-full w-full cursor-pointer"
                      />
                      {isUploading.white ? (
                        <div className="absolute h-20 w-20 mx-auto max-w-full max-h-full object-contain flex justify-center items-center">
                          <Loader2 className="animate-spin" />
                        </div>
                      ) : footerProperties.logoProperties.logoImage.light ? (
                        <div className="absolute">
                          <img
                            className=" h-20 w-20 mx-auto  object-contain "
                            src={
                              footerProperties.logoProperties.logoImage.light
                            }
                            alt="brand white logo"
                          />
                          <div className="w-10 h-10 p-2 rounded-full bg-blue-400 absolute opacity-0 group-hover:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center duration-300">
                            <Camera className=" text-gray-100" />
                          </div>
                        </div>
                      ) : (
                        <Camera className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:text-blue-500 duration-300" />
                      )}
                    </div>
                    <p className="text-sm text-center">Logo on Light</p>
                  </div>
                  <div className="w-full">
                    <div
                      onClick={() => handleUploadClick(false)}
                      className="h-28 flex bg-black justify-center items-center border relative cursor-pointer group"
                    >
                      <input
                        ref={darkLogoRef}
                        onChange={handleDarkLogoUpload}
                        accept="image/*"
                        id="darkLogo"
                        name="darkLogo"
                        type="file"
                        className="opacity-0 h-full w-full cursor-pointer"
                      />
                      {footerProperties.logoProperties.logoImage.dark && (
                        <img
                          className="absolute h-20 w-20 mx-auto max-w-full max-h-full object-contain "
                          src={footerProperties.logoProperties.logoImage.dark}
                          alt="brand white logo"
                        />
                      )}
                      {isUploading.dark ? (
                        <div className="absolute h-20 w-20 mx-auto max-w-full max-h-full object-contain flex justify-center items-center">
                          <Loader2 className="animate-spin text-white" />
                        </div>
                      ) : footerProperties.logoProperties.logoImage.dark ? (
                        <div className="absolute">
                          <img
                            className=" h-20 w-20 mx-auto  object-contain "
                            src={footerProperties.logoProperties.logoImage.dark}
                            alt="brand white logo"
                          />
                          <div className="w-10 h-10 p-2 rounded-full bg-blue-400 absolute opacity-0 group-hover:opacity-100 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center duration-300">
                            <Camera className=" text-gray-100" />
                          </div>
                        </div>
                      ) : (
                        <Camera className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:text-blue-500 duration-300" />
                      )}
                    </div>
                    <p className="text-sm text-center">Logo on Dark/Color</p>
                  </div>
                </div>

                {footerProperties.logoProperties.showLogo && (
                  <div className="space-y-2">
                    <Label htmlFor="logoPosition">Logo Position</Label>
                    <Select
                      value={footerProperties.logoProperties.logoPosition}
                      onValueChange={handleSelectChange(
                        "logoProperties.logoPosition"
                      )}
                    >
                      <SelectTrigger id="logoPosition">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="opacity">Logo Opacity</Label>
                    <span className="text-sm text-gray-700 font-semibold">
                      {footerProperties.logoProperties.opacity}
                    </span>
                  </div>
                  <Slider
                    id="opacity"
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={[footerProperties.logoProperties.opacity]}
                    value={[footerProperties.logoProperties.opacity]}
                    onValueChange={handleSliderChange("logoProperties.opacity")}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="scale">Logo Scale</Label>
                    <span className="text-sm text-gray-700 font-semibold">
                      {footerProperties.logoScale}
                    </span>
                  </div>
                  <Slider
                    id="scale"
                    min={0.5}
                    max={1.1}
                    step={0.1}
                    defaultValue={[footerProperties.logoScale]}
                    value={[footerProperties.logoScale]}
                    onValueChange={handleSliderChange("logoScale")}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="offsetX">Logo Horizontal Offset</Label>
                    <span className="text-sm text-gray-700 font-semibold">
                      {footerProperties.logoOffset.x}px
                    </span>
                  </div>
                  <Slider
                    id="offsetX"
                    min={-10}
                    max={50}
                    step={1}
                    defaultValue={[footerProperties.logoOffset.x]}
                    value={[footerProperties.logoOffset.x]}
                    onValueChange={handleSliderChange("logoOffset.x")}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="offsetY">Logo Vertical Offset</Label>
                    <span className="text-sm text-gray-700 font-semibold ">
                      {footerProperties.logoOffset.y * -1}px
                    </span>
                  </div>
                  <Slider
                    id="offsetY"
                    min={-10}
                    max={10}
                    step={1}
                    defaultValue={[footerProperties.logoOffset.y]}
                    value={[footerProperties.logoOffset.y]}
                    onValueChange={handleSliderChange("logoOffset.y")}
                  />
                </div>
              </div>
            </div>

            {/* Footer Message Configuration */}
            <div className="pb-4">
              <h3 className="text-lg font-medium mb-4">Footer Message</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showMessage" className="flex-1">
                    Show Message
                  </Label>
                  <Switch
                    id="showMessage"
                    checked={footerProperties.footerMessage.showMessage}
                    onCheckedChange={handleSwitchChange(
                      "footerMessage.showMessage"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message Text</Label>
                  <Textarea
                    id="message"
                    value={footerProperties.footerMessage.message}
                    onChange={handleTextChange("footerMessage.message")}
                    className="h-20 border border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <span className="text-sm text-gray-700 font-semibold">
                      {footerProperties.footerMessage.fontSize}px
                    </span>
                  </div>
                  <Slider
                    id="fontSize"
                    min={8}
                    max={14}
                    step={0.1}
                    defaultValue={[footerProperties.footerMessage.fontSize]}
                    value={[footerProperties.footerMessage.fontSize]}
                    onValueChange={handleSliderChange("footerMessage.fontSize")}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="font-opacity">Opacity</Label>
                    <span className="text-sm text-gray-700 font-semibold">
                      {footerProperties.footerMessage.opacity}
                    </span>
                  </div>
                  <Slider
                    id="font-opacity"
                    min={0.5}
                    max={1}
                    step={0.1}
                    defaultValue={[footerProperties.footerMessage.opacity]}
                    value={[footerProperties.footerMessage.opacity]}
                    onValueChange={handleSliderChange("footerMessage.opacity")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex gap-4 mt-4 justify-end">
            <Button
              variant="outline"
              onClick={() => handleReset()}
              className="bg-white text-gray-500 hover:bg-gray-100"
            >
              Reset to Default
            </Button>
            <Button className="ml-2" onClick={handleSave} variant="default">
              Save Changes
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SlideFooter;

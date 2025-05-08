import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageType, PresentationConfig } from "../type";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ConfigurationSelectsProps {
  config: PresentationConfig;
  onConfigChange: (key: keyof PresentationConfig, value: string) => void;
}

export function ConfigurationSelects({
  config,
  onConfigChange,
}: ConfigurationSelectsProps) {
  const [slideOptions, setSlideOptions] = useState([
    "5",
    "8",
    "10",
    "12",
    "15",
    "18",
    "20",
  ]);
  const [openLanguage, setOpenLanguage] = useState(false);

  return (
    <div className="flex  flex-wrap order-1 gap-4">
      <Select
        value={config.slides || ""}
        onValueChange={(value) => {
          onConfigChange("slides", value);
        }}
      >
        <SelectTrigger className="w-[180px] font-satoshi font-medium bg-blue-100 border-blue-200 focus-visible:ring-blue-300 ">
          <SelectValue placeholder="Select Slides" />
        </SelectTrigger>
        <SelectContent className="font-satoshi">
          {slideOptions.map((option) => (
            <SelectItem
              key={option}
              value={option}
              className="font-satoshi text-sm font-medium"
            >
              {option === "Auto" ? "Auto" : option + " Slides"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* <Select
                value={config.theme}
                onValueChange={(value) => {
                    onConfigChange('theme', value as ThemeType)
                }}
            >
                <SelectTrigger className="w-[180px] font-satoshi font-medium bg-[#EBEBEB]">
                    <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent className='font-satoshi'>
                    {Object.values(ThemeType).filter((option) => option !== 'custom').map((option) => (
                        <SelectItem key={option} value={option}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select> */}
      <Popover open={openLanguage} onOpenChange={setOpenLanguage}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openLanguage}
            className="w-[200px] justify-between font-satoshi font-semibold overflow-hidden bg-blue-100 hover:bg-blue-100  border-blue-200 focus-visible:ring-blue-300 border-none"
          >
            <p className="text-sm font-medium truncate">
              {config.language || "Select language"}
            </p>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="end">
          <Command>
            <CommandInput
              placeholder="Search language..."
              className="font-satoshi"
            />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {Object.values(LanguageType).map((language) => (
                  <CommandItem
                    key={language}
                    value={language}
                    onSelect={(currentValue) => {
                      onConfigChange("language", currentValue as LanguageType);
                      setOpenLanguage(false);
                    }}
                    className="font-satoshi"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        config.language === language
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {language}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

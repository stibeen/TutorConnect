"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
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

const modalities = [
  { value: "face-to-face", label: "Face-to-Face" },
  { value: "online", label: "Online Meeting" },
];

const ModalitySelection = ({
  selectedModality,
  onModalityChange,
  disabled = false,
  isGroupSession = false, // NEW: Add this prop
  groupSessionModality = "", // NEW: Add this prop for group session modality
}) => {
  const [openModality, setOpenModality] = React.useState(false);

  // NEW: Get display label for selected modality
  const getDisplayLabel = () => {
    if (!selectedModality) return "Select modality...";

    if (isGroupSession && groupSessionModality) {
      const modality = modalities.find((m) => m.value === groupSessionModality);
      return modality ? modality.label : "Select modality...";
    }

    return (
      modalities.find((modality) => modality.value === selectedModality)
        ?.label || "Select modality..."
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">
          Please select preferred modality:
        </h3>
        {disabled && <Lock className="h-4 w-4 text-muted-foreground" />}
      </div>
      <Popover open={openModality} onOpenChange={setOpenModality}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openModality}
            className={cn(
              "w-full justify-between",
              disabled && "cursor-not-allowed opacity-60"
            )}
            disabled={disabled}
          >
            {getDisplayLabel()} {/* NEW: Use the new function */}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search modality..." />
            <CommandList>
              <CommandEmpty>No modality found.</CommandEmpty>
              <CommandGroup>
                {modalities.map((modality) => (
                  <CommandItem
                    key={modality.value}
                    value={modality.value}
                    onSelect={(currentValue) => {
                      if (!disabled) {
                        onModalityChange(
                          currentValue === selectedModality ? "" : currentValue
                        );
                        setOpenModality(false);
                      }
                    }}
                    className={cn(disabled && "cursor-not-allowed opacity-60")}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedModality === modality.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {modality.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {disabled && (
        <p className="text-sm text-muted-foreground">
          Modality is locked to match the existing group session.
        </p>
      )}
    </div>
  );
};

export default ModalitySelection;

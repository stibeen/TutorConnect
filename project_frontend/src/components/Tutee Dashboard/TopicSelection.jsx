import React from "react";
import { Check, ChevronsUpDown, Lock } from "lucide-react";
import { cn } from "../../lib/utils";
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

export default function TopicSelection({
  tutor,
  selectedTopic,
  onTopicChange,
  hasError = false,
  disabled = false,
  isGroupSession = false, // NEW: Add this prop
  groupSessionTopic = "", // NEW: Add this prop for group session topic
}) {
  const [openTopic, setOpenTopic] = React.useState(false);

  // Convert tutor's expertise array to the format needed for the combobox
  const topics =
    tutor?.expertise?.map((topic, index) => ({
      value: `topic-${index}`,
      label: topic,
    })) || [];

  // NEW: Get display label for selected topic
  const getDisplayLabel = () => {
    if (!selectedTopic) return "Select topic...";
    
    if (isGroupSession && groupSessionTopic) {
      return groupSessionTopic;
    }
    
    return topics.find((topic) => topic.value === selectedTopic)?.label || "Select topic...";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-medium">Please select a topic:</h3>
        {disabled && <Lock className="h-4 w-4 text-muted-foreground" />}
      </div>
      <Popover open={openTopic} onOpenChange={setOpenTopic}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={openTopic}
            className={cn(
              "w-full justify-between",
              hasError && "border-red-500 ring-1 ring-red-500",
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
            <CommandInput placeholder="Search topic..." />
            <CommandList>
              <CommandEmpty>No topic found.</CommandEmpty>
              <CommandGroup>
                {topics.map((topic) => (
                  <CommandItem
                    key={topic.value}
                    value={topic.value}
                    onSelect={(currentValue) => {
                      if (!disabled) {
                        onTopicChange(
                          currentValue === selectedTopic ? "" : currentValue
                        );
                        setOpenTopic(false);
                      }
                    }}
                    className={cn(
                      disabled && "cursor-not-allowed opacity-60"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTopic === topic.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {topic.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {hasError && (
        <p className="text-sm text-red-500">Please select a topic</p>
      )}
      {disabled && (
        <p className="text-sm text-muted-foreground">
          Topic is locked to match the existing group session.
        </p>
      )}
    </div>
  );
}
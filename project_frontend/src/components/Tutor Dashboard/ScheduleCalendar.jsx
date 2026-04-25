"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Clock, Plus, Save, Trash } from "lucide-react"
import { useState } from "react"

export function ScheduleCalendar() {
  const [date, setDate] = useState(new Date());

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr]">
        <Calendar mode="single" selected={date} onSelect={setDate} className="border rounded-md" />

        <Separator orientation="vertical" className="hidden md:block" />
        <Separator className="md:hidden" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">
                Time Slots for {date?.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
              </h3>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-3 w-3" />
              Add Slot
            </Button>
          </div>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="slot-1" defaultChecked />
                  <Label htmlFor="slot-1" className="text-sm">
                    9:00 AM - 10:00 AM
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="available">
                    <SelectTrigger className="h-7 w-[110px] text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="slot-2" defaultChecked />
                  <Label htmlFor="slot-2" className="text-sm">
                    11:00 AM - 12:00 PM
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="booked">
                    <SelectTrigger className="h-7 w-[110px] text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="slot-3" defaultChecked />
                  <Label htmlFor="slot-3" className="text-sm">
                    2:00 PM - 3:00 PM
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="available">
                    <SelectTrigger className="h-7 w-[110px] text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="slot-4" defaultChecked />
                  <Label htmlFor="slot-4" className="text-sm">
                    3:00 PM - 4:00 PM
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="booked">
                    <SelectTrigger className="h-7 w-[110px] text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="slot-5" defaultChecked />
                  <Label htmlFor="slot-5" className="text-sm">
                    5:00 PM - 6:00 PM
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="booked">
                    <SelectTrigger className="h-7 w-[110px] text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Save Schedule
          </Button>
        </div>
      </div>
    </div>
  )
}

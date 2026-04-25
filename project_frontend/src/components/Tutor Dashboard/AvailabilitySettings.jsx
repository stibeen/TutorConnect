import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save } from "lucide-react"

export function AvailabilitySettings() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="session">Session Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="availability-status">Availability Status</Label>
              <Switch id="availability-status" defaultChecked />
            </div>
            <p className="text-sm text-muted-foreground">When turned off, you won't receive new booking requests</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Advance Notice Required</Label>
            <Select defaultValue="24">
              <SelectTrigger>
                <SelectValue placeholder="Select hours" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Minimum time before a session that students can book</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Booking Window</Label>
            <Select defaultValue="30">
              <SelectTrigger>
                <SelectValue placeholder="Select days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">How far in advance students can book sessions</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Automatic Confirmation</Label>
            <RadioGroup defaultValue="manual">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="auto" id="auto-confirm" />
                <Label htmlFor="auto-confirm">Automatically confirm all bookings</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual-confirm" />
                <Label htmlFor="manual-confirm">Manually review each booking request</Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center">
              <div className="font-medium">Mon</div>
              <div className="font-medium">Tue</div>
              <div className="font-medium">Wed</div>
              <div className="font-medium">Thu</div>
              <div className="font-medium">Fri</div>
              <div className="font-medium">Sat</div>
              <div className="font-medium">Sun</div>
            </div>

            <div className="grid grid-cols-7 gap-2">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="monday" defaultChecked />
                  <Label htmlFor="monday">Available</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Select defaultValue="9">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9:00 AM</SelectItem>
                      <SelectItem value="10">10:00 AM</SelectItem>
                      <SelectItem value="11">11:00 AM</SelectItem>
                      <SelectItem value="12">12:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Select defaultValue="17">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="17">5:00 PM</SelectItem>
                      <SelectItem value="18">6:00 PM</SelectItem>
                      <SelectItem value="19">7:00 PM</SelectItem>
                      <SelectItem value="20">8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="tuesday" defaultChecked />
                  <Label htmlFor="tuesday">Available</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Select defaultValue="9">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9:00 AM</SelectItem>
                      <SelectItem value="10">10:00 AM</SelectItem>
                      <SelectItem value="11">11:00 AM</SelectItem>
                      <SelectItem value="12">12:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Select defaultValue="17">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="17">5:00 PM</SelectItem>
                      <SelectItem value="18">6:00 PM</SelectItem>
                      <SelectItem value="19">7:00 PM</SelectItem>
                      <SelectItem value="20">8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="wednesday" defaultChecked />
                  <Label htmlFor="wednesday">Available</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Select defaultValue="9">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9:00 AM</SelectItem>
                      <SelectItem value="10">10:00 AM</SelectItem>
                      <SelectItem value="11">11:00 AM</SelectItem>
                      <SelectItem value="12">12:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Select defaultValue="17">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="17">5:00 PM</SelectItem>
                      <SelectItem value="18">6:00 PM</SelectItem>
                      <SelectItem value="19">7:00 PM</SelectItem>
                      <SelectItem value="20">8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="thursday" defaultChecked />
                  <Label htmlFor="thursday">Available</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Select defaultValue="9">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9:00 AM</SelectItem>
                      <SelectItem value="10">10:00 AM</SelectItem>
                      <SelectItem value="11">11:00 AM</SelectItem>
                      <SelectItem value="12">12:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Select defaultValue="17">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="17">5:00 PM</SelectItem>
                      <SelectItem value="18">6:00 PM</SelectItem>
                      <SelectItem value="19">7:00 PM</SelectItem>
                      <SelectItem value="20">8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="friday" defaultChecked />
                  <Label htmlFor="friday">Available</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Select defaultValue="9">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9">9:00 AM</SelectItem>
                      <SelectItem value="10">10:00 AM</SelectItem>
                      <SelectItem value="11">11:00 AM</SelectItem>
                      <SelectItem value="12">12:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Select defaultValue="17">
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="17">5:00 PM</SelectItem>
                      <SelectItem value="18">6:00 PM</SelectItem>
                      <SelectItem value="19">7:00 PM</SelectItem>
                      <SelectItem value="20">8:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="saturday" />
                  <Label htmlFor="saturday">Available</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Select defaultValue="10" disabled>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10:00 AM</SelectItem>
                      <SelectItem value="11">11:00 AM</SelectItem>
                      <SelectItem value="12">12:00 PM</SelectItem>
                      <SelectItem value="13">1:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Select defaultValue="15" disabled>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">3:00 PM</SelectItem>
                      <SelectItem value="16">4:00 PM</SelectItem>
                      <SelectItem value="17">5:00 PM</SelectItem>
                      <SelectItem value="18">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="sunday" />
                  <Label htmlFor="sunday">Available</Label>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">From</Label>
                  <Select defaultValue="10" disabled>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Start time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10:00 AM</SelectItem>
                      <SelectItem value="11">11:00 AM</SelectItem>
                      <SelectItem value="12">12:00 PM</SelectItem>
                      <SelectItem value="13">1:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">To</Label>
                  <Select defaultValue="15" disabled>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">3:00 PM</SelectItem>
                      <SelectItem value="16">4:00 PM</SelectItem>
                      <SelectItem value="17">5:00 PM</SelectItem>
                      <SelectItem value="18">6:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="session" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Default Session Duration</Label>
            <Select defaultValue="60">
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Buffer Time Between Sessions</Label>
            <Select defaultValue="15">
              <SelectTrigger>
                <SelectValue placeholder="Select buffer time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No buffer</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Time between consecutive sessions</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Hourly Rate</Label>
            <div className="flex items-center">
              <span className="mr-2">$</span>
              <Input type="number" defaultValue="45" />
            </div>
            <p className="text-sm text-muted-foreground">Your hourly rate for tutoring sessions</p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Session Format</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="format-online" defaultChecked />
                <Label htmlFor="format-online">Online (Video)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="format-inperson" />
                <Label htmlFor="format-inperson">In-person</Label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button className="w-full">
        <Save className="mr-2 h-4 w-4" />
        Save Settings
      </Button>
    </div>
  )
}

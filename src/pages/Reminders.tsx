import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Clock, Smartphone } from "lucide-react";
import Navigation from "@/components/Navigation";

const days = [
  { value: "sunday", label: "Zondag" },
  { value: "monday", label: "Maandag" },
  { value: "tuesday", label: "Dinsdag" },
  { value: "wednesday", label: "Woensdag" },
  { value: "thursday", label: "Donderdag" },
  { value: "friday", label: "Vrijdag" },
  { value: "saturday", label: "Zaterdag" },
];

const times = [
  { value: "09:00", label: "09:00" },
  { value: "12:00", label: "12:00" },
  { value: "15:00", label: "15:00" },
  { value: "18:00", label: "18:00" },
  { value: "19:00", label: "19:00" },
  { value: "20:00", label: "20:00" },
];

const Reminders = () => {
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [selectedDay, setSelectedDay] = useState("sunday");
  const [selectedTime, setSelectedTime] = useState("19:00");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Herinneringen
        </h1>
        <p className="text-muted-foreground">
          Stel wekelijkse herinneringen in om contact te houden
        </p>
      </div>

      {/* Reminder Settings */}
      <div className="px-6 space-y-6">
        {/* Enable/Disable */}
        <Card className="p-6 contact-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="text-primary" size={20} />
              <div>
                <h3 className="font-semibold text-foreground">Herinneringen</h3>
                <p className="text-sm text-muted-foreground">
                  Ontvang wekelijkse check-in herinneringen
                </p>
              </div>
            </div>
            <Switch
              checked={remindersEnabled}
              onCheckedChange={setRemindersEnabled}
            />
          </div>
        </Card>

        {remindersEnabled && (
          <>
            {/* Day Selection */}
            <Card className="p-6 contact-card">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-primary" size={20} />
                <h3 className="font-semibold text-foreground">Dag van de week</h3>
              </div>
              
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Time Selection */}
            <Card className="p-6 contact-card">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-primary" size={20} />
                <h3 className="font-semibold text-foreground">Tijd</h3>
              </div>
              
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {times.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Preview */}
            <Card className="p-6 contact-card">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="text-accent-foreground" size={20} />
                <h3 className="font-semibold text-foreground">Preview</h3>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Bell size={14} className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      Check-in App
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Heb je al bij je dierbaren ingecheckt deze week? 
                      Mama heeft voor het laatst ingecheckt 2 dagen geleden.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {days.find(d => d.value === selectedDay)?.label} {selectedTime}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <Button className="w-full rounded-xl h-12 text-base font-semibold">
              Instellingen opslaan
            </Button>
          </>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Reminders;
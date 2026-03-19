"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calendar,
  Search,
  X,
  Settings,
  Trash2,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";

export default function DailyPlanner() {
  const [darkMode, setDarkMode] = useState(false);
  const [tasksOpen, setTasksOpen] = useState(true);
  const [accentHue, setAccentHue] = useState(250);
  const [accentChroma, setAccentChroma] = useState(0.14);
  const [surfaceHue, setSurfaceHue] = useState(250);
  const [jump, setJump] = useState(0.07);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <main className="mx-auto max-w-xl space-y-4 p-4">
      {/* ═══ CARD 1 — App Header ═══ */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Daily Planner</CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Button variant="ghost" size="sm">
              <Settings className="mr-1 h-4 w-4" />
              Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex gap-2 pt-0">
          <Button variant="secondary" className="flex-1">
            Today
          </Button>
          <Button variant="secondary" className="flex-1">
            This Week
          </Button>
          <Button variant="secondary" className="flex-1">
            Archive
          </Button>
        </CardContent>
      </Card>

      {/* ═══ CARD 2 — Search Bar ═══ */}
      <Card>
        <CardContent className="flex items-center gap-2 py-3">
          <Input
            type="search"
            placeholder="Search tasks…"
            className="flex-1"
          />
          <Button variant="ghost" size="icon" aria-label="Clear search">
            <X className="h-4 w-4" />
          </Button>
          <Button size="icon" aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* ═══ CARD 3 — Add Task Form ═══ */}
      <Card>
        <CardHeader>
          <CardTitle>Add Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input type="text" placeholder="Task title…" />
          <Textarea placeholder="Notes (optional)…" />
          <div className="grid grid-cols-2 gap-3">
            <Input type="date" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Priority…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-3">
          <Button variant="ghost" type="reset">
            Clear
          </Button>
          <Button type="submit">Add Task</Button>
        </CardFooter>
      </Card>

      {/* ═══ CARD 4 — Task List (collapsible) ═══ */}
      <Collapsible open={tasksOpen} onOpenChange={setTasksOpen}>
        <Card>
          <CollapsibleTrigger>
            <CardHeader className="cursor-pointer flex flex-row items-center justify-between space-y-0">
              <CardTitle>Today&apos;s Tasks</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  3 pending
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${
                    tasksOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              {/* Task 1 */}
              <div className="flex items-center gap-3">
                <Checkbox id="task-1" />
                <Label htmlFor="task-1" className="flex-1 cursor-pointer">
                  Review project proposal and leave comments
                </Label>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete task"
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Task 2 */}
              <div className="flex items-center gap-3">
                <Checkbox id="task-2" />
                <Label htmlFor="task-2" className="flex-1 cursor-pointer">
                  Schedule team sync for Q2 planning
                </Label>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete task"
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Task 3 (completed) */}
              <div className="flex items-center gap-3">
                <Checkbox id="task-3" defaultChecked />
                <Label
                  htmlFor="task-3"
                  className="flex-1 cursor-pointer text-muted-foreground line-through"
                >
                  Send weekly status update email
                </Label>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete task"
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ═══ CARD 5 — Weekly Stats ═══ */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="text-3xl font-bold">12</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold">8</div>
              <div className="text-xs text-muted-foreground">In progress</div>
            </div>
            <div>
              <div className="text-3xl font-bold">3</div>
              <div className="text-xs text-muted-foreground">Overdue</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1</div>
              <div className="text-xs text-muted-foreground">On hold</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ CARD 6 — Quick Settings ═══ */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme select */}
          <div className="grid grid-cols-4 items-center gap-3">
            <Label>Theme</Label>
            <div className="col-span-3">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="System default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System default</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font size */}
          <div className="grid grid-cols-4 items-center gap-3">
            <Label>Font size</Label>
            <div className="col-span-3">
              <Slider defaultValue={[16]} min={12} max={24} step={1} />
            </div>
          </div>

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <Label htmlFor="notif-check">Enable desktop notifications</Label>
            <Checkbox id="notif-check" />
          </div>

          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-3">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              className="col-span-3"
            />
          </div>

          {/* Reminder radio group */}
          <div className="grid grid-cols-4 items-center gap-3">
            <Label>Reminder</Label>
            <RadioGroup
              defaultValue="15"
              className="col-span-3 flex gap-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="15" id="r-15" />
                <Label htmlFor="r-15">15 min</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="30" id="r-30" />
                <Label htmlFor="r-30">30 min</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="60" id="r-60" />
                <Label htmlFor="r-60">1 hour</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-3">
          <Button variant="ghost">Reset to defaults</Button>
          <Button>Save settings</Button>
        </CardFooter>
      </Card>

      {/* ═══ CARD 7 — Skin Reference ═══ */}
      <Card>
        <CardHeader>
          <CardTitle>Skin Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            shadcn/ui button variants shown for comparison with PAUMEN skins.
          </p>

          <div>
            <h4 className="mb-2 text-sm font-semibold">
              default · secondary · outline
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button>default</Button>
              <Button variant="secondary">secondary</Button>
              <Button variant="outline">outline</Button>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">
              ghost · destructive · disabled
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="ghost">ghost</Button>
              <Button variant="destructive">destructive</Button>
              <Button disabled>disabled</Button>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">
              freeform equivalent
            </h4>
            <p className="text-sm text-muted-foreground">
              No direct equivalent — shadcn/ui components always carry their
              own styles. Custom content uses plain divs/JSX.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ CARD 8 — Color Test Controls ═══ */}
      <Card>
        <CardHeader>
          <CardTitle>Color Test Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dark mode toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="mode-toggle" className="flex items-center gap-2">
              {darkMode ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              Dark mode
            </Label>
            <Checkbox
              id="mode-toggle"
              checked={darkMode}
              onCheckedChange={toggleDark}
            />
          </div>

          {/* Accent hue */}
          <div className="grid grid-cols-12 items-center gap-2">
            <Label className="col-span-3 text-sm">Accent hue</Label>
            <div className="col-span-7">
              <Slider
                value={[accentHue]}
                onValueChange={(v) => setAccentHue(Array.isArray(v) ? v[0] : v)}
                min={0}
                max={360}
                step={1}
              />
            </div>
            <Input
              type="number"
              value={accentHue}
              onChange={(e) => setAccentHue(Number(e.target.value))}
              min={0}
              max={360}
              className="col-span-2"
            />
          </div>

          {/* Accent chroma */}
          <div className="grid grid-cols-12 items-center gap-2">
            <Label className="col-span-3 text-sm">Accent chroma</Label>
            <div className="col-span-7">
              <Slider
                value={[accentChroma * 1000]}
                onValueChange={(v) => setAccentChroma((Array.isArray(v) ? v[0] : v) / 1000)}
                min={0}
                max={400}
                step={5}
              />
            </div>
            <Input
              type="number"
              value={accentChroma}
              onChange={(e) => setAccentChroma(Number(e.target.value))}
              min={0}
              max={0.4}
              step={0.005}
              className="col-span-2"
            />
          </div>

          {/* Surface hue */}
          <div className="grid grid-cols-12 items-center gap-2">
            <Label className="col-span-3 text-sm">Surface hue</Label>
            <div className="col-span-7">
              <Slider
                value={[surfaceHue]}
                onValueChange={(v) => setSurfaceHue(Array.isArray(v) ? v[0] : v)}
                min={0}
                max={360}
                step={1}
              />
            </div>
            <Input
              type="number"
              value={surfaceHue}
              onChange={(e) => setSurfaceHue(Number(e.target.value))}
              min={0}
              max={360}
              className="col-span-2"
            />
          </div>

          {/* Jump */}
          <div className="grid grid-cols-12 items-center gap-2">
            <Label className="col-span-3 text-sm">Jump (step)</Label>
            <div className="col-span-7">
              <Slider
                value={[jump * 1000]}
                onValueChange={(v) => setJump((Array.isArray(v) ? v[0] : v) / 1000)}
                min={0}
                max={200}
                step={5}
              />
            </div>
            <Input
              type="number"
              value={jump}
              onChange={(e) => setJump(Number(e.target.value))}
              min={0}
              max={0.2}
              step={0.005}
              className="col-span-2"
            />
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setAccentHue(250);
              setAccentChroma(0.14);
              setSurfaceHue(250);
              setJump(0.07);
              setDarkMode(false);
              document.documentElement.classList.remove("dark");
            }}
          >
            Reset to defaults
          </Button>
          <Button
            onClick={() => {
              const vars = [
                `--accent-hue: ${accentHue};`,
                `--accent-chroma: ${accentChroma};`,
                `--surface-hue: ${surfaceHue};`,
                `--jump: ${jump};`,
              ].join("\n");
              navigator.clipboard.writeText(vars);
            }}
          >
            Copy CSS vars
          </Button>
        </CardFooter>
      </Card>

      {/* ═══ CARD 9 — Freeform Escape Hatch ═══ */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-lg bg-zinc-900 p-5 font-mono text-sm text-emerald-400 leading-relaxed">
            &lt;Card&gt;
            <br />
            &nbsp;&nbsp;{"{/* No shadcn constraints here */}"}
            <br />
            &nbsp;&nbsp;{"{/* Custom CSS, third-party widgets, canvas elements */}"}
            <br />
            &lt;/Card&gt;
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

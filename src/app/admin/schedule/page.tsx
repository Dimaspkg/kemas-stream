
'use client';
import * as React from 'react';
import {
  addScheduledVideo,
  deleteScheduledVideo,
  getScheduledVideos,
  updateScheduledVideo,
  type Schedule
} from '@/services/video-service';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CalendarIcon, MoreHorizontal, PlusCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, setHours, setMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { PreviewDialog } from '@/components/schedule/preview-dialog';

const handleDateWithTime = (date: Date | undefined, timeStr: string) => {
    if (!date) return undefined;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return undefined;
    return setMinutes(setHours(date, hours), minutes);
};

const scheduleSchema = z
  .object({
    title: z.string().min(1, 'Title is required.'),
    type: z.enum(['video', 'image']),
    url: z.string().url('Please enter a valid URL.'),
    startTime: z.date({ required_error: 'Start date is required.' }),
    endTime: z.date({ required_error: 'End date is required.' }),
    startTimeStr: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
    endTimeStr: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  })
  .refine((data) => {
      const start = handleDateWithTime(data.startTime, data.startTimeStr);
      const end = handleDateWithTime(data.endTime, data.endTimeStr);
      return end && start ? end > start : false;
  }, {
    message: 'End time must be after start time.',
    path: ['endTimeStr'],
  });

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

function ScheduleForm({
  schedule,
  onFinished,
}: {
  schedule?: Schedule;
  onFinished: () => void;
}) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);

  const defaultValues: Partial<ScheduleFormValues> = schedule ? {
      title: schedule.title,
      url: schedule.url,
      type: schedule.type,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      startTimeStr: format(schedule.startTime, "HH:mm"),
      endTimeStr: format(schedule.endTime, "HH:mm"),
  } : {
      title: '',
      url: '',
      type: 'video',
      startTimeStr: '09:00',
      endTimeStr: '17:00',
  };

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues,
  });
  
  const selectedType = form.watch('type');


  const onSubmit = async (data: ScheduleFormValues) => {
    try {
       const finalStartTime = handleDateWithTime(data.startTime, data.startTimeStr);
       const finalEndTime = handleDateWithTime(data.endTime, data.endTimeStr);

       if (!finalStartTime || !finalEndTime) {
           toast({ variant: 'destructive', title: 'Error', description: 'Invalid date or time.' });
           return;
       }

      const scheduleData = {
        title: data.title,
        url: data.url,
        type: data.type,
        startTime: finalStartTime,
        endTime: finalEndTime,
      };

      if (schedule) {
        await updateScheduledVideo(schedule.id, scheduleData);
        toast({ title: 'Success', description: 'Schedule updated successfully.' });
      } else {
        await addScheduledVideo(scheduleData);
        toast({ title: 'Success', description: 'Schedule added successfully.' });
      }
      onFinished();
      setIsOpen(false);
      form.reset();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {schedule ? (
          <button className="w-full text-left">Edit</button>
        ) : (
          <Button>
            <PlusCircle className="mr-2" />
            Add Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit' : 'Add'} Schedule</DialogTitle>
          <DialogDescription>
            {schedule ? 'Update the details of this scheduled stream.' : 'Add a new item to the schedule.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Morning Show" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem className="space-y-2">
                    <FormLabel>Content Type</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                        >
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <RadioGroupItem value="video" id="video" />
                            </FormControl>
                            <FormLabel htmlFor="video" className="font-normal">Video</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2">
                            <FormControl>
                            <RadioGroupItem value="image" id="image" />
                            </FormControl>
                            <FormLabel htmlFor="image" className="font-normal">Image</FormLabel>
                        </FormItem>
                        </RadioGroup>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder={selectedType === 'video' ? 'Video URL' : 'Image URL'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="startTimeStr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time (24h)</FormLabel>
                      <FormControl>
                        <Input placeholder="HH:mm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="endTimeStr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time (24h)</FormLabel>
                      <FormControl>
                        <Input placeholder="HH:mm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteConfirmationDialog({
  schedule,
  onFinished,
}: {
  schedule: Schedule;
  onFinished: () => void;
}) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDelete = async () => {
    try {
      await deleteScheduledVideo(schedule.id);
      toast({ title: 'Success', description: 'Schedule deleted successfully.' });
      onFinished();
      setIsOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button className="w-full text-left text-red-600">
          Delete
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            "{schedule.title}" schedule.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function SchedulePage() {
  const [schedules, setSchedules] = React.useState<Schedule[]>([]);

  const fetchSchedules = React.useCallback(async () => {
    const data = await getScheduledVideos();
    setSchedules(data);
  }, []);

  React.useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return (
    <div className="p-8 pt-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Content Schedule</h2>
          <p className="text-muted-foreground">
            Manage your scheduled video streams and images.
          </p>
        </div>
        <ScheduleForm onFinished={fetchSchedules} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.title}</TableCell>
                   <TableCell>
                    <Badge variant={schedule.type === 'video' ? 'secondary' : 'outline'}>
                      {schedule.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {schedule.url}
                  </TableCell>
                  <TableCell>{format(schedule.startTime, "PPp")}</TableCell>
                  <TableCell>{format(schedule.endTime, "PPp")}</TableCell>
                   <TableCell>
                    <PreviewDialog schedule={schedule} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <ScheduleForm schedule={schedule} onFinished={fetchSchedules} />
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()} asChild>
                           <DeleteConfirmationDialog schedule={schedule} onFinished={fetchSchedules} />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No schedules found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

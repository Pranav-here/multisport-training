"use client"

import { useState } from 'react';
import { Check, X, Play, Clock } from 'lucide-react';
import { MOCK_MODERATION_QUEUE } from '@/lib/discovery/mock-data';
import { CONTENT_TAGS } from '@/lib/discovery/constants';
import { ModerationQueueItem, ModerationStatus } from '@/lib/discovery/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ModerationQueuePage() {
  const [queue, setQueue] = useState<ModerationQueueItem[]>(MOCK_MODERATION_QUEUE);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  const currentItem = queue[currentIndex];
  const pendingCount = queue.filter(item => item.moderationStatus === 'pending').length;

  const handleApprove = (itemId: string) => {
    setQueue(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, moderationStatus: 'approved' as ModerationStatus }
        : item
    ));

    toast({
      title: 'Clip approved',
      description: 'This clip is now live in the Discovery feed',
    });

    moveToNext();
  };

  const handleReject = (itemId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection reason required',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    setQueue(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, moderationStatus: 'rejected' as ModerationStatus }
        : item
    ));

    toast({
      title: 'Clip rejected',
      description: `Athlete will be notified: ${rejectionReason}`,
    });

    setRejectionReason('');
    moveToNext();
  };

  const moveToNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const moveToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentItem) {
    return (
      <div className="container max-w-4xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Moderation Queue</CardTitle>
            <CardDescription>No clips pending review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              All caught up! There are no clips waiting for moderation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Discovery Moderation Queue</h1>
        <p className="text-muted-foreground">
          Review and approve clips for the Discovery feed
        </p>
        <div className="mt-4 flex items-center gap-4">
          <Badge variant="secondary" className="text-base">
            <Clock className="mr-2 h-4 w-4" />
            {pendingCount} pending
          </Badge>
          <span className="text-sm text-muted-foreground">
            Viewing {currentIndex + 1} of {queue.length}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Video preview */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                <video
                  src={currentItem.videoUrl}
                  poster={currentItem.thumbnailUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {currentItem.athleteName[0]}
                  </div>
                  <div>
                    <p className="font-semibold">{currentItem.athleteName}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(currentItem.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Caption:</p>
                  <p className="text-sm text-muted-foreground">{currentItem.caption}</p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentItem.tags.map(tagId => {
                      const tag = CONTENT_TAGS.find(t => t.id === tagId);
                      return tag ? (
                        <Badge key={tagId} variant="secondary">
                          {tag.icon} {tag.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                <div>
                  <Badge>{currentItem.sport}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={moveToPrev}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={moveToNext}
              disabled={currentIndex === queue.length - 1}
              className="flex-1"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Moderation actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Decision</CardTitle>
              <CardDescription>
                Review the clip for appropriateness and quality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Guidelines:</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Content is positive and appropriate</li>
                  <li>Tags accurately describe the clip</li>
                  <li>Video quality is acceptable</li>
                  <li>No promotional or commercial content</li>
                  <li>Follows community standards</li>
                </ul>
              </div>

              {currentItem.moderationStatus === 'pending' ? (
                <>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(currentItem.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rejection reason (optional):</label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why this clip cannot be approved..."
                      rows={3}
                    />
                    <Button
                      onClick={() => handleReject(currentItem.id)}
                      variant="destructive"
                      className="w-full"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </>
              ) : (
                <div className={cn(
                  "rounded-lg p-4 text-center",
                  currentItem.moderationStatus === 'approved'
                    ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300"
                )}>
                  <p className="font-semibold">
                    {currentItem.moderationStatus === 'approved' ? 'Approved' : 'Rejected'}
                  </p>
                  <p className="text-sm mt-1">
                    This clip has already been moderated
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Queue Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total in queue:</span>
                  <span className="font-semibold">{queue.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending review:</span>
                  <span className="font-semibold">{pendingCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved:</span>
                  <span className="font-semibold text-green-600">
                    {queue.filter(item => item.moderationStatus === 'approved').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rejected:</span>
                  <span className="font-semibold text-red-600">
                    {queue.filter(item => item.moderationStatus === 'rejected').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

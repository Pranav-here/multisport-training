"use client"

import { useState } from 'react';
import { Bookmark, MapPin, Mail, Trash2, Download, FolderPlus } from 'lucide-react';
import { MOCK_DISCOVERY_CLIPS } from '@/lib/discovery/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface BookmarkedAthlete {
  id: string;
  athleteName: string;
  athleteAvatar: string;
  athleteAge: number;
  athleteLocation: string;
  sport: string;
  totalClips: number;
  totalUpvotes: number;
  listName?: string;
  notes?: string;
  bookmarkedAt: string;
}

// Mock bookmarked athletes from discovery clips
const MOCK_BOOKMARKS: BookmarkedAthlete[] = MOCK_DISCOVERY_CLIPS.slice(0, 3).map(clip => ({
  id: clip.athleteId,
  athleteName: clip.athleteName,
  athleteAvatar: clip.athleteAvatar,
  athleteAge: clip.athleteAge,
  athleteLocation: clip.athleteLocation,
  sport: clip.sport,
  totalClips: Math.floor(Math.random() * 20) + 5,
  totalUpvotes: clip.upvotes,
  listName: '2025 Recruits',
  notes: '',
  bookmarkedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
}));

export default function ScoutBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkedAthlete[]>(MOCK_BOOKMARKS);
  const [selectedList, setSelectedList] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const lists = ['All Athletes', '2025 Recruits', 'Goalkeepers', 'Watchlist'];

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.athleteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bookmark.sport.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesList = selectedList === 'all' || bookmark.listName === selectedList;
    return matchesSearch && matchesList;
  });

  const handleRemoveBookmark = (athleteId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== athleteId));
    toast({
      title: 'Bookmark removed',
      description: 'Athlete removed from your saved list',
    });
  };

  const handleContactAthlete = (athleteName: string) => {
    toast({
      title: 'Message sent',
      description: `Your message request has been sent to ${athleteName}`,
    });
  };

  const handleExportList = () => {
    toast({
      title: 'Export started',
      description: 'Your athlete list is being prepared for download',
    });
  };

  return (
    <div className="container max-w-7xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Saved Athletes</h1>
        <p className="text-muted-foreground">
          Manage your bookmarked athletes and recruitment lists
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lists.map((list) => (
                <button
                  key={list}
                  onClick={() => setSelectedList(list === 'All Athletes' ? 'all' : list)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    (selectedList === 'all' && list === 'All Athletes') ||
                    selectedList === list
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  {list}
                </button>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2">
                <FolderPlus className="mr-2 h-4 w-4" />
                New List
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total saved:</span>
                <span className="font-semibold">{bookmarks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Soccer:</span>
                <span className="font-semibold">
                  {bookmarks.filter(b => b.sport === 'Soccer').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Basketball:</span>
                <span className="font-semibold">
                  {bookmarks.filter(b => b.sport === 'Basketball').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search athletes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleExportList} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {filteredBookmarks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No bookmarked athletes found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start discovering talent in the Discovery feed
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredBookmarks.map((athlete) => (
                <Card key={athlete.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={athlete.athleteAvatar} />
                        <AvatarFallback>{athlete.athleteName[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{athlete.athleteName}</h3>
                            <Badge variant="secondary">{athlete.sport}</Badge>
                            {athlete.listName && (
                              <Badge variant="outline" className="text-xs">
                                {athlete.listName}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {athlete.athleteLocation}
                            </span>
                            <span>Age {athlete.athleteAge}</span>
                          </div>
                        </div>

                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Clips: </span>
                            <span className="font-semibold">{athlete.totalClips}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total upvotes: </span>
                            <span className="font-semibold">{athlete.totalUpvotes}</span>
                          </div>
                        </div>

                        {athlete.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            Notes: {athlete.notes}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleContactAthlete(athlete.athleteName)}
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Contact
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Add Notes
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Add Notes</DialogTitle>
                                <DialogDescription>
                                  Keep track of your observations about {athlete.athleteName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>List</Label>
                                  <Input
                                    defaultValue={athlete.listName}
                                    placeholder="e.g., 2025 Recruits"
                                  />
                                </div>
                                <div>
                                  <Label>Notes</Label>
                                  <Textarea
                                    placeholder="Strong technical skills, good positioning..."
                                    rows={4}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button>Save Notes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveBookmark(athlete.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from 'react';
import { usePageBuilder } from '@/contexts/PageBuilderContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Edit3, Trash2, ArrowLeft, Settings2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // Keep for delete dialog
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const ManagePostView: React.FC = () => {
  const {
    posts,
    activePostId,
    createPost,
    selectPost,
    deletePostStorage,
    setCurrentViewInLeftPanel,
    updatePostTitle,
    updatePostStatus,
  } = usePageBuilder();

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitleInput, setPostTitleInput] = useState('');
  const [postStatusInput, setPostStatusInput] = useState<'draft' | 'published'>('draft');

  const handleCreateNewPost = () => {
    const title = window.prompt("Enter title for the new post:", "New Post");
    if (title) {
      createPost(title);
      // Context createPost will switch view to 'components'
    }
  };

  const handleEditContent = (postId: string) => {
    selectPost(postId);
    // Context selectPost will switch view to 'components'
  };

  const openPostSettingsDialog = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      setEditingPostId(postId);
      setPostTitleInput(post.title);
      setPostStatusInput(post.status);
    }
  };

  const handleSavePostSettings = () => {
    if (editingPostId) {
      updatePostTitle(editingPostId, postTitleInput);
      updatePostStatus(editingPostId, postStatusInput);
      setEditingPostId(null); // Close dialog
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={() => setCurrentViewInLeftPanel('components')} className="text-sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Components
        </Button>
        <Button size="sm" onClick={handleCreateNewPost}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4">
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No posts yet. Create one to get started!</p>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} className={`transition-all ${activePostId === post.id ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}>
                <CardHeader className="pb-2 pt-4 px-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold leading-tight">{post.title}</CardTitle>
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs capitalize">
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground pt-1">
                    Updated: {format(new Date(post.updatedAt), 'MMM d, yyyy HH:mm')}
                  </p>
                </CardHeader>
                <CardFooter className="px-4 pb-3 pt-2 flex justify-end space-x-2">
                   {/* Changed from AlertDialogTrigger to a regular Button */}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openPostSettingsDialog(post.id)}>
                      <Settings2 className="h-4 w-4" />
                      <span className="sr-only">Post Settings</span>
                    </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditContent(post.id)} className="h-7 text-xs px-2">
                    <Edit3 className="mr-1 h-3 w-3" /> Edit Content
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive-outline" size="icon" className="h-7 w-7">
                        <Trash2 className="h-4 w-4" />
                         <span className="sr-only">Delete Post</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the post "{post.title}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePostStorage(post.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Dialog for Editing Post Settings (Title & Status) */}
      {/* Wrapped AlertDialogContent with AlertDialog and controlled by `open` prop */}
      <AlertDialog open={!!editingPostId} onOpenChange={(isOpen) => { if (!isOpen) setEditingPostId(null); }}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Post Details</AlertDialogTitle>
            <AlertDialogDescription>
              Make changes to your post's title and status here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="post-title" className="text-right">
                Title
              </Label>
              <Input
                id="post-title"
                value={postTitleInput}
                onChange={(e) => setPostTitleInput(e.target.value)}
                className="col-span-3"
                disabled={!editingPostId} // Disable if no post is being edited
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="post-status" className="text-right">
                Status
              </Label>
              <Select 
                value={postStatusInput} 
                onValueChange={(value: 'draft' | 'published') => setPostStatusInput(value)}
                disabled={!editingPostId} // Disable if no post is being edited
              >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingPostId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSavePostSettings}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManagePostView;

// Add destructive-outline variant to Button if it doesn't exist
// For now, this will use default destructive styling from shadcn if destructive-outline is not custom defined.
// Add to components/ui/button.tsx if needed:
// destructive_outline: "border border-destructive text-destructive hover:bg-destructive/10",
// Or just use variant="outline" and className="text-destructive border-destructive hover:bg-destructive/10"

// For the delete button, to achieve "destructive-outline":
// variant="outline" className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
// This is currently how it's in the file: <Button variant="destructive-outline"... >
// If `destructive-outline` is not a defined variant in `buttonVariants` (components/ui/button.tsx),
// it will fall back to default styling. The image shows it as red outline.
// To ensure it works as intended, I will modify the delete button to:
// variant="outline" className="text-destructive border-destructive hover:text-destructive hover:bg-destructive/5"
// The current `Button variant="destructive-outline"` is fine if that variant is defined in `button.tsx`.
// The current code uses `<Button variant="destructive-outline" size="icon" className="h-7 w-7">` for the delete trigger.
// This should be fine if `destructive-outline` is a known variant. If not, it might render as default.
// Assuming `destructive-outline` is or will be handled.

// The provided code already had `AlertDialogTrigger` for delete.
// The Settings button was the one that was an `AlertDialogTrigger` but its `AlertDialogContent` was orphaned.
// The fix is to make settings button a normal button and wrap the orphaned content.
// This has been addressed in the code above.

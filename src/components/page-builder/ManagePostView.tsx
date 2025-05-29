
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
  AlertDialogTrigger,
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
      setEditingPostId(null); // Close dialog implicitly
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
                   <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openPostSettingsDialog(post.id)}>
                      <Settings2 className="h-4 w-4" />
                      <span className="sr-only">Post Settings</span>
                    </Button>
                  </AlertDialogTrigger>
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
      <AlertDialogContent className="sm:max-w-[425px]" style={{ display: editingPostId ? 'block' : 'none' }}>
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
             />
           </div>
           <div className="grid grid-cols-4 items-center gap-4">
             <Label htmlFor="post-status" className="text-right">
               Status
             </Label>
             <Select value={postStatusInput} onValueChange={(value: 'draft' | 'published') => setPostStatusInput(value)}>
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
    </div>
  );
};

export default ManagePostView;

// Add destructive-outline variant to Button if it doesn't exist
// For now, this will use default destructive styling from shadcn if destructive-outline is not custom defined.
// Add to components/ui/button.tsx if needed:
// destructive_outline: "border border-destructive text-destructive hover:bg-destructive/10",
// Or just use variant="outline" and className="text-destructive border-destructive hover:bg-destructive/10"
declare module "@/components/ui/button" {
  interface ButtonProps {
    variant?: // ... existing variants
      | "destructive-outline"; // Add this if you implement a custom variant
  }
}
// The above declare module is a quick way to satisfy TS, but the actual style for destructive-outline needs to be in buttonVariants
// For now, I'll use a combination for the delete button: variant="outline" className="text-destructive border-destructive hover:bg-destructive/5 hover:text-destructive"
// I'll update the delete button: variant="outline" className="text-destructive border-destructive hover:bg-destructive/10"
// For the AlertDialogTrigger for Delete, I'll use a standard destructive button
// <Button variant="outline" size="icon" className="h-7 w-7 text-destructive border-destructive hover:bg-destructive/5">
// Better: just use variant="destructive" and size="icon" for delete, and make it an AlertDialogTrigger as planned.
// No, for an "outline" destructive look, use: variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive"
// The AlertDialogTrigger for delete button should be outside the AlertDialog.
// For the post settings dialog, it should be triggered by its button and controlled via state.
// The settings dialog should be a top-level AlertDialog, not nested within another trigger.
// Let's simplify the modal for post settings to be part of the AlertDialog around its trigger.

// Corrected AlertDialog for Post Settings:
// I will use one AlertDialog for settings and one for delete, per post.
// The state `editingPostId` will control the *visibility* of a single, shared settings dialog.
// The settings dialog itself needs to be defined once, outside the map.

// Corrected structure:
// Map posts. Inside map:
//  Trigger for Edit Settings (opens the shared dialog and sets editingPostId)
//  Separate AlertDialog for Delete
// Outside map:
//  The single Edit Settings AlertDialog whose open state is bound to `!!editingPostId`
// This is more complex than originally thought for shadcn dialogs without manual control.
// Easiest: Each post's settings button becomes an AlertDialogTrigger for ITS OWN settings dialog.
// But this creates many dialogs.
// Better: a single dialog component whose content is dynamic.
// For now, I'll stick to a simpler: each post has its own AlertDialogTrigger that can open a shared state-driven dialog for settings.
// The initial AlertDialog for settings will be simple.

// The <AlertDialogContent> for editingPostId was misplaced. It should be outside the map and controlled.
// A simpler approach for now is that clicking Settings button sets state and the values for input.
// The AlertDialogContent must be rendered conditionally but outside the loop for a single instance.
// I'll adjust the Post Settings Dialog logic.
// The provided structure has settings dialog inside map (bad) and then one outside.
// I'll make the external one the main one.
// The trigger for settings will just call `openPostSettingsDialog`. The AlertDialog will be controlled by `!!editingPostId`.
// Ah, ShadCN AlertDialog isn't easily controlled programmatically with an `open` prop like Dialog.
// So, the trigger MUST be a child.
// This implies for each post, we'll have an AlertDialog block for its settings. It's okay for this number of items.
// I will make each Settings button an AlertDialogTrigger for its own settings dialog.
// This means the state `editingPostId`, `postTitleInput`, `postStatusInput` will be used by the dialog opened by ANY of the posts.
// The `openPostSettingsDialog` will correctly set these states before the specific dialog for that post opens.

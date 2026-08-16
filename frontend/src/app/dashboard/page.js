'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, FileText, LogOut, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Pagination from '@/components/pagination';
import Alert from '@/components/alert';

const NOTE_LIMIT = 10;
const POST_LIMIT = 10;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [notePage, setNotePage] = useState(1);
  const [notePages, setNotePages] = useState(1);
  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(1);
  const [postPages, setPostPages] = useState(1);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadNotes = useCallback(async (page) => {
    try {
      const data = await api(`/notes?page=${page}&limit=${NOTE_LIMIT}`);
      setNotes(data.notes);
      setNotePages(data.pagination.pages);
      setNotePage(page);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadPosts = useCallback(async (page) => {
    try {
      const data = await api(`/posts?page=${page}&limit=${POST_LIMIT}`);
      setPosts(data.posts);
      setPostPages(data.pagination.pages);
      setPostPage(page);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const stored = window.localStorage.getItem('user');
    let u = null;
    if (stored) {
      try {
        u = JSON.parse(stored);
      } catch (err) {
        u = null;
      }
    }
    setUser(u);
    if (u && u.role === 'admin') {
      router.replace('/admin');
      return;
    }
    loadNotes(1);
    loadPosts(1);
  }, [router, loadNotes, loadPosts]);

  function handleLogout() {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    router.replace('/login');
  }

  async function handleCreateNote(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api('/notes', {
        method: 'POST',
        body: JSON.stringify({ title: noteTitle, content: noteContent })
      });
      setNoteTitle('');
      setNoteContent('');
      setMessage('Note created');
      loadNotes(1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteNote(id) {
    setError('');
    setMessage('');
    try {
      await api(`/notes/${id}`, { method: 'DELETE' });
      setMessage('Note deleted');
      loadNotes(notePage);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateNote(id) {
    setError('');
    setMessage('');
    try {
      await api(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      setEditingId(null);
      setMessage('Note updated');
      loadNotes(notePage);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreatePost(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api('/posts', {
        method: 'POST',
        body: JSON.stringify({ title: postTitle, content: postContent })
      });
      setPostTitle('');
      setPostContent('');
      setMessage('Post published');
      loadPosts(1);
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(note) {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Secure Notes</span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                <span className="hidden text-sm text-muted-foreground sm:inline">{user.name}</span>
                {user.role === 'admin' && (
                  <Button asChild variant="ghost" size="sm">
                    <a href="/admin">Admin</a>
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 p-4 py-8">
        {error && <Alert variant="error">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">My Notes</h1>
          </div>
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-base">New note</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateNote} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="note-title">Title</Label>
                    <Input
                      id="note-title"
                      placeholder="Note title"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-content">Content</Label>
                    <Textarea
                      id="note-content"
                      className="min-h-[120px]"
                      placeholder="Write your note..."
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus />
                    Add note
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {notes.length === 0 && (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No notes yet. Create your first note.
                  </CardContent>
                </Card>
              )}
              {notes.map((note) => (
                <Card key={note._id}>
                  <CardContent className="p-4">
                    {editingId === note._id ? (
                      <div className="space-y-3">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title"
                        />
                        <Textarea
                          className="min-h-[80px]"
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Content"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateNote(note._id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium">{note.title}</h3>
                          <div className="flex shrink-0 gap-1">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(note)}>
                              <Pencil />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note._id)}>
                              <Trash2 />
                            </Button>
                          </div>
                        </div>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{note.content}</p>
                        <p className="text-xs text-muted-foreground/70">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {notes.length > 0 && (
                <Pagination
                  page={notePage}
                  pages={notePages}
                  onPrev={() => loadNotes(notePage - 1)}
                  onNext={() => loadNotes(notePage + 1)}
                />
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Posts</h1>
          </div>
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-base">New post</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="post-title">Title</Label>
                    <Input
                      id="post-title"
                      placeholder="Post title"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="post-content">Content</Label>
                    <Textarea
                      id="post-content"
                      className="min-h-[100px]"
                      placeholder="Visible to everyone..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Plus />
                    Publish post
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {posts.length === 0 && (
                <Card>
                  <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No posts yet.
                  </CardContent>
                </Card>
              )}
              {posts.map((post) => (
                <Card key={post._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium">{post.title}</h3>
                      <Badge variant="secondary" className="shrink-0">
                        {post.author ? post.author.name : 'unknown'}
                      </Badge>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{post.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
              {posts.length > 0 && (
                <Pagination
                  page={postPage}
                  pages={postPages}
                  onPrev={() => loadPosts(postPage - 1)}
                  onNext={() => loadPosts(postPage + 1)}
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

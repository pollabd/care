'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Tags,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Pagination from '@/components/pagination';
import Alert from '@/components/alert';

const LIMIT = 10;

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);
  const [notes, setNotes] = useState([]);
  const [notePage, setNotePage] = useState(1);
  const [notePages, setNotePages] = useState(1);
  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(1);
  const [postPages, setPostPages] = useState(1);
  const [interestGroups, setInterestGroups] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [interests, setInterests] = useState('');
  const [userId, setUserId] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [userPostsPage, setUserPostsPage] = useState(1);
  const [userPostsPages, setUserPostsPages] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUsers = useCallback(async (page) => {
    try {
      const data = await api(`/users?page=${page}&limit=${LIMIT}`);
      setUsers(data.users);
      setUserPages(data.pagination.pages);
      setUserPage(page);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadNotes = useCallback(async (page) => {
    try {
      const data = await api(`/notes?page=${page}&limit=${LIMIT}`);
      setNotes(data.notes);
      setNotePages(data.pagination.pages);
      setNotePage(page);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadPosts = useCallback(async (page) => {
    try {
      const data = await api(`/posts?page=${page}&limit=${LIMIT}`);
      setPosts(data.posts);
      setPostPages(data.pagination.pages);
      setPostPage(page);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadInterests = useCallback(async () => {
    try {
      const data = await api('/users/grouped-by-interests');
      setInterestGroups(data.interests);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadUserPosts = useCallback(
    async (page) => {
      if (!userId) {
        return;
      }
      try {
        const data = await api(`/posts/user/${userId}?page=${page}&limit=${LIMIT}`);
        setUserPosts(data.posts);
        setUserPostsPages(data.pagination.pages);
        setUserPostsPage(page);
      } catch (err) {
        setError(err.message);
      }
    },
    [userId]
  );

  useEffect(() => {
    const token = window.localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    const stored = window.localStorage.getItem('user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        if (u.role !== 'admin') {
          router.replace('/dashboard');
          return;
        }
      } catch (err) {
        router.replace('/login');
        return;
      }
    }
    loadUsers(1);
    loadNotes(1);
    loadPosts(1);
    loadInterests();
  }, [router, loadUsers, loadNotes, loadPosts, loadInterests]);

  function handleLogout() {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
    router.replace('/login');
  }

  async function handleAddUser(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const interestList = interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await api('/users', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role, interests: interestList })
      });
      setName('');
      setEmail('');
      setPassword('');
      setInterests('');
      setRole('user');
      setMessage('User added');
      loadUsers(1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdateRole(id, newRole) {
    setError('');
    setMessage('');
    try {
      await api(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      setMessage('User role updated');
      loadUsers(userPage);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteUser(id) {
    setError('');
    setMessage('');
    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      setMessage('User removed');
      loadUsers(userPage);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold">Secure Notes</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href="/dashboard">
                <LayoutDashboard />
                Dashboard
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 p-4 py-8">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
        </div>
        {error && <Alert variant="error">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}

        <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserPlus />
                Add user
              </CardTitle>
              <CardDescription>Create an account for a new user or admin.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddUser} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="add-name">Name</Label>
                  <Input
                    id="add-name"
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email">Email</Label>
                  <Input
                    id="add-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-password">Password</Label>
                  <Input
                    id="add-password"
                    type="password"
                    placeholder="Temporary password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-interests">Interests</Label>
                  <Input
                    id="add-interests"
                    placeholder="chess, reading (comma separated)"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">user</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  <UserPlus />
                  Add user
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users />
                Users
              </CardTitle>
              <CardDescription>Manage accounts and roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Interests</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {(u.interests || []).join(', ') || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                          >
                            Make {u.role === 'admin' ? 'user' : 'admin'}
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u._id)}>
                            <Trash2 />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {users.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    page={userPage}
                    pages={userPages}
                    onPrev={() => loadUsers(userPage - 1)}
                    onNext={() => loadUsers(userPage + 1)}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tags />
              Users grouped by interests
            </CardTitle>
            <CardDescription>Aggregation view: users grouped by each of their interests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {interestGroups.map((g) => (
                <div key={g._id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <Badge>{g._id}</Badge>
                    <span className="text-sm text-muted-foreground">{g.count}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{g.users.map((u) => u.name).join(', ')}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText />
              Everyone's notes
            </CardTitle>
            <CardDescription>All notes across all users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notes.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No notes yet.</p>
              )}
              {notes.map((note) => (
                <div key={note._id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{note.title}</h3>
                    <Badge variant="secondary" className="shrink-0">
                      {note.owner ? note.owner.name : 'unknown'}
                    </Badge>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{note.content}</p>
                </div>
              ))}
            </div>
            {notes.length > 0 && (
              <div className="mt-4">
                <Pagination
                  page={notePage}
                  pages={notePages}
                  onPrev={() => loadNotes(notePage - 1)}
                  onNext={() => loadNotes(notePage + 1)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search />
              Posts by a user
            </CardTitle>
            <CardDescription>Paste a user id to run the $lookup aggregation.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="User id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="sm:max-w-sm"
              />
              <Button onClick={() => loadUserPosts(1)}>
                <Search />
                Load posts
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {userPosts.length === 0 && userId && (
                <p className="py-6 text-center text-sm text-muted-foreground">No posts found for this user.</p>
              )}
              {userPosts.map((post) => (
                <div key={post._id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge variant="secondary" className="shrink-0">
                      {post.author ? post.author.name : 'unknown'}
                    </Badge>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{post.content}</p>
                </div>
              ))}
            </div>
            {userPosts.length > 0 && (
              <div className="mt-4">
                <Pagination
                  page={userPostsPage}
                  pages={userPostsPages}
                  onPrev={() => loadUserPosts(userPostsPage - 1)}
                  onNext={() => loadUserPosts(userPostsPage + 1)}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen />
              All posts
            </CardTitle>
            <CardDescription>Posts visible to everyone. Copy a post's user id to query above.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {posts.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">No posts yet.</p>
              )}
              {posts.map((post) => (
                <div key={post._id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium">{post.title}</h3>
                    <Badge variant="secondary" className="shrink-0">
                      {post.author ? post.author.name : 'unknown'}
                    </Badge>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{post.content}</p>
                  <p className="mt-2 text-xs text-muted-foreground/70">post id: {post._id}</p>
                </div>
              ))}
            </div>
            {posts.length > 0 && (
              <div className="mt-4">
                <Pagination
                  page={postPage}
                  pages={postPages}
                  onPrev={() => loadPosts(postPage - 1)}
                  onNext={() => loadPosts(postPage + 1)}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

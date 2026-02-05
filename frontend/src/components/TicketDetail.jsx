import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Paperclip, 
  MessageSquare,
  Download,
  Image,
  FileText,
  File
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { 
  getTicket, 
  updateTicket, 
  deleteTicket, 
  addNote, 
  uploadAttachment,
  deleteAttachment,
  getTeamMembers 
} from '@/api/client'
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG } from '@/lib/utils'
import { format } from 'date-fns'
import TicketForm from '@/components/TicketForm'

function FileIcon({ mimetype }) {
  if (mimetype?.startsWith('image/')) {
    return <Image className="h-4 w-4" />
  }
  if (mimetype === 'application/pdf' || mimetype?.startsWith('text/')) {
    return <FileText className="h-4 w-4" />
  }
  return <File className="h-4 w-4" />
}

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  
  // Note form state
  const [noteContent, setNoteContent] = useState('')
  const [noteAuthor, setNoteAuthor] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  
  // File upload state
  const [uploading, setUploading] = useState(false)

  async function loadTicket() {
    try {
      setLoading(true)
      const [ticketData, teamData] = await Promise.all([
        getTicket(id),
        getTeamMembers()
      ])
      setTicket(ticketData)
      setTeamMembers(teamData)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTicket()
  }, [id])

  async function handleStatusChange(newStatus) {
    try {
      const updated = await updateTicket(id, { status: newStatus })
      setTicket(prev => ({ ...prev, ...updated }))
      toast.success('Status updated')
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  async function handleAssigneeChange(assigneeId) {
    try {
      const updated = await updateTicket(id, { 
        assignee_id: assigneeId === 'unassigned' ? null : parseInt(assigneeId)
      })
      setTicket(prev => ({ ...prev, ...updated }))
      toast.success('Assignee updated')
    } catch (err) {
      toast.error('Failed to update assignee')
    }
  }

  async function handleAddNote(e) {
    e.preventDefault()
    if (!noteContent.trim() || !noteAuthor.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    
    try {
      setSubmittingNote(true)
      const note = await addNote(id, { content: noteContent, author_name: noteAuthor })
      setTicket(prev => ({ ...prev, notes: [...prev.notes, note] }))
      setNoteContent('')
      toast.success('Note added')
    } catch (err) {
      toast.error('Failed to add note')
    } finally {
      setSubmittingNote(false)
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }
    
    try {
      setUploading(true)
      const attachment = await uploadAttachment(id, file)
      setTicket(prev => ({ ...prev, attachments: [attachment, ...prev.attachments] }))
      toast.success('File uploaded')
    } catch (err) {
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDeleteAttachment(attachmentId) {
    try {
      await deleteAttachment(attachmentId)
      setTicket(prev => ({ 
        ...prev, 
        attachments: prev.attachments.filter(a => a.id !== attachmentId) 
      }))
      toast.success('Attachment deleted')
    } catch (err) {
      toast.error('Failed to delete attachment')
    }
  }

  async function handleDelete() {
    try {
      await deleteTicket(id)
      toast.success('Ticket deleted')
      navigate('/tickets')
    } catch (err) {
      toast.error('Failed to delete ticket')
    }
  }

  function handleEditSuccess() {
    setEditDialogOpen(false)
    loadTicket()
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Ticket</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/tickets">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Tickets
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/tickets">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-muted-foreground font-mono">#{ticket.id}</span>
              <Badge variant={ticket.priority}>{PRIORITY_CONFIG[ticket.priority]?.label}</Badge>
              <Badge variant={ticket.status}>{STATUS_CONFIG[ticket.status]?.label}</Badge>
              <Badge variant="outline">{CATEGORY_CONFIG[ticket.category]?.label}</Badge>
            </div>
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Ticket</DialogTitle>
              </DialogHeader>
              <TicketForm 
                ticket={ticket}
                teamMembers={teamMembers} 
                onSuccess={handleEditSuccess}
                onCancel={() => setEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Ticket</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this ticket? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">
                {ticket.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No notes yet.</p>
              ) : (
                <div className="space-y-4">
                  {ticket.notes.map(note => (
                    <div key={note.id} className="p-4 rounded-lg bg-muted">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{note.author_name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <Separator />
              
              <form onSubmit={handleAddNote} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="noteAuthor">Your Name</Label>
                    <Input
                      id="noteAuthor"
                      value={noteAuthor}
                      onChange={(e) => setNoteAuthor(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="noteContent">Add Note</Label>
                    <Textarea
                      id="noteContent"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write a note..."
                      rows={3}
                    />
                  </div>
                </div>
                <Button type="submit" disabled={submittingNote}>
                  {submittingNote ? 'Adding...' : 'Add Note'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.attachments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No attachments.</p>
              ) : (
                <div className="space-y-2">
                  {ticket.attachments.map(attachment => (
                    <div 
                      key={attachment.id} 
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <FileIcon mimetype={attachment.mimetype} />
                        <div>
                          <p className="font-medium text-sm">{attachment.original_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/api/attachments/${attachment.id}`} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteAttachment(attachment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div>
                <Label htmlFor="fileUpload" className="cursor-pointer">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted transition-colors">
                    <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {uploading ? 'Uploading...' : 'Click to upload a file (max 10MB)'}
                    </p>
                  </div>
                </Label>
                <input
                  id="fileUpload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Assignee</Label>
                <Select 
                  value={ticket.assignee_id ? String(ticket.assignee_id) : 'unassigned'} 
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamMembers.map(member => (
                      <SelectItem key={member.id} value={String(member.id)}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-muted-foreground">Reporter</Label>
                <p className="mt-1 font-medium">{ticket.reporter_name}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Category</Label>
                <p className="mt-1 font-medium">{CATEGORY_CONFIG[ticket.category]?.label}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Priority</Label>
                <p className="mt-1">
                  <Badge variant={ticket.priority}>{PRIORITY_CONFIG[ticket.priority]?.label}</Badge>
                </p>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p className="mt-1 text-sm font-mono">
                  {format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>

              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="mt-1 text-sm font-mono">
                  {format(new Date(ticket.updated_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

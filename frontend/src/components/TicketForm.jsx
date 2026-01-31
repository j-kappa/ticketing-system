import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTicket, updateTicket } from '@/api/client'
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG } from '@/lib/utils'

export default function TicketForm({ ticket, teamMembers = [], onSuccess, onCancel }) {
  const isEditing = !!ticket
  
  const [formData, setFormData] = useState({
    title: ticket?.title || '',
    description: ticket?.description || '',
    reporter_name: ticket?.reporter_name || '',
    status: ticket?.status || 'new',
    priority: ticket?.priority || 'medium',
    category: ticket?.category || 'software',
    assignee_id: ticket?.assignee_id ? String(ticket.assignee_id) : '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  function validate() {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!formData.reporter_name.trim()) {
      newErrors.reporter_name = 'Reporter name is required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!validate()) return
    
    try {
      setSubmitting(true)
      
      const data = {
        ...formData,
        assignee_id: formData.assignee_id ? parseInt(formData.assignee_id) : null,
      }
      
      if (isEditing) {
        await updateTicket(ticket.id, data)
        toast.success('Ticket updated')
      } else {
        await createTicket(data)
        toast.success('Ticket created')
      }
      
      onSuccess?.()
    } catch (err) {
      toast.error(err.message || 'Failed to save ticket')
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Brief summary of the issue"
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title}</p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Detailed description of the issue..."
            rows={4}
          />
        </div>
        
        <div>
          <Label htmlFor="reporter_name">Reporter Name *</Label>
          <Input
            id="reporter_name"
            value={formData.reporter_name}
            onChange={(e) => handleChange('reporter_name', e.target.value)}
            placeholder="Who is reporting this issue?"
            className={errors.reporter_name ? 'border-destructive' : ''}
          />
          {errors.reporter_name && (
            <p className="text-sm text-destructive mt-1">{errors.reporter_name}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={formData.category} 
            onValueChange={(v) => handleChange('category', v)}
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(v) => handleChange('priority', v)}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isEditing && (
          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(v) => handleChange('status', v)}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div>
          <Label htmlFor="assignee">Assign To</Label>
          <Select 
            value={formData.assignee_id || 'unassigned'} 
            onValueChange={(v) => handleChange('assignee_id', v === 'unassigned' ? '' : v)}
          >
            <SelectTrigger id="assignee">
              <SelectValue placeholder="Select assignee" />
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
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : isEditing ? 'Update Ticket' : 'Create Ticket'}
        </Button>
      </div>
    </form>
  )
}

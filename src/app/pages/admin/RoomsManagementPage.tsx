import React, { useState, useEffect } from 'react';
import { roomTypes, getLocalRooms, saveLocalRooms } from '../../data/rooms';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Clock,
  Image as ImageIcon,
  Loader2,
  X,
  Calendar
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";

interface Room {
  id: number;
  room_number: string | number;
  room_type: string;
  price: string | number;
  capacity: string;
  status: string;
  is_reserved: boolean;
  amenities: string[];
  image_url?: string;
}

export default function RoomsManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter(room => 
    room.room_number.toString().includes(searchQuery) ||
    room.room_type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Form State
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    room_type: 'standard',
    price: roomTypes.standard.price,
    capacity: roomTypes.standard.capacity,
    status: 'available',
    image_url: '',
    amenities: roomTypes.standard.amenities
  });
  const [amenityInput, setAmenityInput] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewRoom(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rooms/read.php');
      const data = await response.json();
      if (Array.isArray(data)) {
        setRooms(data);
      } else {
        setRooms(getLocalRooms());
      }
    } catch (error: any) {
      console.error("Error fetching rooms, using local storage:", error);
      setRooms(getLocalRooms());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddAmenity = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && amenityInput.trim()) {
      e.preventDefault();
      if (!newRoom.amenities.includes(amenityInput.trim())) {
        setNewRoom({
          ...newRoom,
          amenities: [...newRoom.amenities, amenityInput.trim()]
        });
      }
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setNewRoom({
      ...newRoom,
      amenities: newRoom.amenities.filter(a => a !== amenity)
    });
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setNewRoom({
      room_number: room.room_number.toString(),
      room_type: room.room_type,
      price: typeof room.price === 'string' ? parseFloat(room.price) : room.price,
      capacity: room.capacity,
      status: room.status,
      image_url: room.image_url || '',
      amenities: room.amenities || []
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const url = editingRoom ? '/api/rooms/update.php' : '/api/rooms/create.php';
      const body = editingRoom ? { ...newRoom, id: editingRoom.id } : newRoom;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        toast.success(editingRoom ? "Room updated successfully!" : "Room added successfully!");
        setIsAddModalOpen(false);
        setEditingRoom(null);
        setNewRoom({
          room_number: '',
          room_type: 'standard',
          price: roomTypes.standard.price,
          capacity: roomTypes.standard.capacity,
          status: 'available',
          image_url: '',
          amenities: roomTypes.standard.amenities
        });
        fetchRooms();
      } else {
        const result = await response.json();
        throw new Error(result.message || "Failed to save room");
      }
    } catch (error) {
      console.warn("API rooms save failed, using local storage backup:", error);
      const localRooms = getLocalRooms();
      if (editingRoom) {
        const updated = localRooms.map(r => {
          if (r.id === editingRoom.id) {
            return {
              ...r,
              room_number: newRoom.room_number,
              room_type: newRoom.room_type as any,
              price: Number(newRoom.price),
              capacity: newRoom.capacity,
              status: newRoom.status as any,
              image_url: newRoom.image_url || roomTypes[newRoom.room_type as keyof typeof roomTypes].image_url,
              amenities: newRoom.amenities
            };
          }
          return r;
        });
        saveLocalRooms(updated);
        toast.success("Room updated successfully (Local Storage)!");
      } else {
        const newId = localRooms.length > 0 ? Math.max(...localRooms.map(r => r.id)) + 1 : 1;
        const added = {
          id: newId,
          room_number: newRoom.room_number,
          room_type: newRoom.room_type as any,
          price: Number(newRoom.price),
          capacity: newRoom.capacity,
          status: newRoom.status as any,
          is_reserved: false,
          image_url: newRoom.image_url || roomTypes[newRoom.room_type as keyof typeof roomTypes].image_url,
          amenities: newRoom.amenities
        };
        localRooms.push(added);
        saveLocalRooms(localRooms);
        toast.success("Room added successfully (Local Storage)!");
      }
      setIsAddModalOpen(false);
      setEditingRoom(null);
      setNewRoom({
        room_number: '',
        room_type: 'standard',
        price: roomTypes.standard.price,
        capacity: roomTypes.standard.capacity,
        status: 'available',
        image_url: '',
        amenities: roomTypes.standard.amenities
      });
      fetchRooms();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setRoomToDelete(id);
  };

  const confirmDelete = async () => {
    if (!roomToDelete) return;
    
    try {
      const response = await fetch('/api/rooms/delete.php', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify({ id: roomToDelete })
      });
      
      if (response.ok) {
        toast.success("Room deleted");
        fetchRooms();
      } else {
        throw new Error("Failed to delete room");
      }
    } catch (error) {
      console.warn("API room deletion failed, deleting from local storage backup:", error);
      const localRooms = getLocalRooms();
      const filtered = localRooms.filter(r => r.id !== roomToDelete);
      saveLocalRooms(filtered);
      toast.success("Room deleted (Local Storage)");
      fetchRooms();
    } finally {
      setRoomToDelete(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Rooms Management</h1>
          <p className="text-slate-500 font-medium">Manage your hotel inventory and room status.</p>
        </div>

        <Dialog 
          open={isAddModalOpen} 
          onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) {
              setEditingRoom(null);
              setNewRoom({
                room_number: '',
                room_type: 'standard',
                price: roomTypes.standard.price,
                capacity: roomTypes.standard.capacity,
                status: 'available',
                image_url: '',
                amenities: roomTypes.standard.amenities
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 bg-[#1E73BE] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1A63A5] transition-all shadow-lg shadow-[#1E73BE]/20">
              <Plus className="w-5 h-5" />
              <span>Add New Room</span>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_number">Room Number</Label>
                  <Input 
                    id="room_number" 
                    placeholder="e.g. 101" 
                    required
                    value={newRoom.room_number}
                    onChange={e => setNewRoom({...newRoom, room_number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room_type">Room Type</Label>
                  <Select 
                    value={newRoom.room_type} 
                    onValueChange={v => {
                      const type = v as keyof typeof roomTypes;
                      setNewRoom({
                        ...newRoom, 
                        room_type: v,
                        price: roomTypes[type].price,
                        capacity: roomTypes[type].capacity,
                        amenities: roomTypes[type].amenities
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="deluxe">Deluxe</SelectItem>
                      <SelectItem value="sweet">Sweet</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">Auto-filled Price</p>
                  <p className="text-xl font-bold text-[#1E73BE]">${newRoom.price}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">Auto-filled Capacity</p>
                  <p className="text-lg font-semibold">{newRoom.capacity}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_file">Upload Room Image (from device)</Label>
                <Input 
                  id="image_file" 
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
                {newRoom.image_url && (
                  <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                    <img src={newRoom.image_url} alt="Room preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewRoom({...newRoom, image_url: ''})}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Amenities (Press Enter to add)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newRoom.amenities.map(a => (
                    <span key={a} className="bg-[#1E73BE]/10 text-[#1E73BE] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      {a}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => removeAmenity(a)} />
                    </span>
                  ))}
                </div>
                <Input 
                  placeholder="Free WiFi, TV..." 
                  value={amenityInput}
                  onChange={e => setAmenityInput(e.target.value)}
                  onKeyDown={handleAddAmenity}
                />
              </div>

              <DialogFooter>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#1E73BE] text-white py-3 rounded-xl font-bold hover:bg-[#1A63A5] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Create Room'}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by room number or type..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1E73BE]/20 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span>Showing {filteredRooms.length} of {rooms.length} rooms</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-20">
            <Loader2 className="w-8 h-8 text-[#1E73BE] animate-spin" />
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">No rooms found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amenities</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
                        {room.image_url ? (
                          <img src={room.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">#{room.room_number}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{room.capacity}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium capitalize">{room.room_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-900 font-bold">${room.price}</span>
                    <span className="text-slate-400 text-xs font-medium"> / night</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize w-fit ${
                        room.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                        room.status === 'occupied' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {room.status === 'available' && <CheckCircle2 className="w-3 h-3" />}
                        {room.status === 'occupied' && <Clock className="w-3 h-3" />}
                        {room.status === 'maintenance' && <XCircle className="w-3 h-3" />}
                        {room.status}
                      </span>
                      {room.is_reserved && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 w-fit">
                          <Calendar className="w-2.5 h-2.5" />
                          Reserved
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(room.amenities || []).slice(0, 3).map((a, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                          {a}
                        </span>
                      ))}
                      {(room.amenities || []).length > 3 && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          +{(room.amenities || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(room)}
                        className="p-2 text-slate-400 hover:text-[#1E73BE] hover:bg-[#1E73BE]/5 rounded-lg transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(room.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!roomToDelete} onOpenChange={(open) => !open && setRoomToDelete(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the room and all its associated data from the servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-slate-200">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 rounded-xl"
            >
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

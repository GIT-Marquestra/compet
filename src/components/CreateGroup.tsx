'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Group {
  id: string;
  name: string;
  coordinator: User;
  coordinatorId: string;
  members: User[];
  groupPoints: number;
}

interface GroupApplication {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  applicantId: string;
  groupId: string;
  createdAt: Date;
}

const GroupManagement = () => {
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [showExistingGroups, setShowExistingGroups] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [existingGroups, setExistingGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserGroups();
    }
  }, [session]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/groups/create', {
        name: groupName,
        userEmail: session?.user?.email,
      });

      if (response.status === 200) {
        toast.success('Group created successfully!');
        router.push('/user/dashboard');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast.error('Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (groupId: string) => {
    try {
      const response = await axios.post('/api/groups/apply', {
        groupId,
        userEmail: session?.user?.email,
      });

      if (response.status === 200) {
        toast.success('Application submitted successfully!');
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const response = await axios.post('/api/groups/leave', {
        groupId,
        userEmail: session?.user?.email,
      });

      if (response.status === 200) {
        toast.success('Left group successfully!');
        fetchUserGroups(); // Refresh user groups
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message);
    }
  };

  const fetchExistingGroups = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post("/api/groups", {
        body: {
          userEmail: session?.user?.email
        }
      });
      console.log(response)
      setExistingGroups(response.data.groups);
      setShowExistingGroups(true);
      setShowNewGroupForm(false);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async () => {
    try {
      const response = await axios.get('/api/groups/user', {
        params: { email: session?.user?.email }
      });
      setUserGroups(response.data.groups);
    } catch (err) {
      const error = err as Error;
      toast.error('Failed to fetch your groups');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mt-20">
      <CardHeader>
        <CardTitle>Group Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* My Groups Section */}
          {userGroups.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">My Groups</h3>
              {userGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-500">Members: {group.members._count.members}</p>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleLeaveGroup(group.id)}
                  >
                    Leave Group
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={() => {
                setShowNewGroupForm(true);
                setShowExistingGroups(false);
              }}
              className="w-1/2"
            >
              Create New Group
            </Button>
            <Button 
              onClick={fetchExistingGroups}
              className="w-1/2"
            >
              View Existing Groups
            </Button>
          </div>

          {showNewGroupForm && (
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <Input
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Group'}
              </Button>
            </form>
          )}

          {showExistingGroups && (
            <div className="space-y-4">
              {existingGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">{group.name}</h3>
                    <p className="text-sm text-gray-500">Members: {group.members.length}</p>
                    <p className="text-sm text-gray-500">
                      Coordinator: {group.coordinator.username}
                    </p>
                  </div>
                  {!userGroups.some(g => g.id === group.id) && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleApply(group.id)}
                    >
                      Apply
                    </Button>
                  )}
                </div>
              ))}
              {existingGroups.length === 0 && (
                <p className="text-center text-gray-500">No groups found</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupManagement;
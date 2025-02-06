'use client'
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import toast from 'react-hot-toast';

const GroupManagement = () => {
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);
  const [showExistingGroups, setShowExistingGroups] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  const [existingGroups, setExistingGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession()

  const handleCreateGroup = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { name: groupName, userEmail: session?.user?.email },
      });

      console.log(response)

      if (response.status !== 200) {
        toast.error('Some error occured')
      }

      router.push('/user/dashboard'); // Or wherever you want to redirect after success
    } catch (err) {
        //@ts-ignore
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingGroups = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/groups', {
        headers: {
            "Content-Type": "application/json",
          },
        body: {
            //@ts-ignore
            userEmail: session?.user?.email
        }
      });

      console.log("All groups: ", response)

      setExistingGroups(response.groups);
      setShowExistingGroups(true);
      setShowNewGroupForm(false);
    } catch (err) {
        //@ts-ignore
      setError(err.message);
    } finally {
      setLoading(false);
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
                    <p className="text-sm text-gray-500">Members: {group.members?.length || 0}</p>
                  </div>
                  <Button variant="outline">Apply</Button>
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
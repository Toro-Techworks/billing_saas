import { useEffect, useState } from 'react'
import api from '../services/api'

type User = {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    api.get('/users').then((res) => setUsers(res.data.data ?? []))
  }, [])

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold">User Management</h1>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="py-2">{user.name}</td>
              <td className="py-2">{user.email}</td>
              <td className="py-2">{user.role}</td>
              <td className="py-2">{user.is_active ? 'Active' : 'Disabled'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

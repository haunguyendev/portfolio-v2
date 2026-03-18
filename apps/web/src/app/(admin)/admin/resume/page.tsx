import { gqlClient } from '@/lib/graphql-client'
import { gql } from 'graphql-request'
import { ResumeManagement } from '@/components/admin/resume-management'

const RESUMES_QUERY = gql`
  query Resumes {
    resumes {
      id type fileName filePath fileSize isActive createdAt updatedAt
    }
  }
`

export interface ResumeItem {
  id: string
  type: 'UPLOADED' | 'GENERATED'
  fileName: string
  filePath: string
  fileSize: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const revalidate = 0

export default async function AdminResumePage() {
  let resumes: ResumeItem[] = []

  try {
    const data = await gqlClient.request<{ resumes: ResumeItem[] }>(RESUMES_QUERY)
    resumes = data.resumes
  } catch {
    // API not available — show empty state
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Resume Management</h1>
      <ResumeManagement initialResumes={resumes} />
    </div>
  )
}

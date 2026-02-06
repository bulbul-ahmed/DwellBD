import { Request, Response } from 'express'
import {
  getDashboardStatistics,
  getPropertiesForAdmin,
  updatePropertyByAdmin,
  getUsersForAdmin,
  updateUserByAdmin,
  getPendingApprovals,
  getAnalyticsData,
  getMonthlyTrends
} from '../services/adminService'

export async function getDashboardStatsHandler(req: Request, res: Response): Promise<void> {
  try {
    const stats = await getDashboardStatistics()
    res.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
}

export async function getAllPropertiesHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query
    const searchStr = typeof search === 'string' ? search : ''
    const statusStr = typeof status === 'string' ? status : ''
    const result = await getPropertiesForAdmin(
      Number(page),
      Number(limit),
      {
        search: searchStr,
        status: statusStr
      }
    )
    res.json(result)
  } catch (error) {
    console.error('Error fetching properties:', error)
    res.status(500).json({ error: 'Failed to fetch properties' })
  }
}

export async function updatePropertyHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    if (!id) {
      res.status(400).json({ error: 'Property ID is required' })
      return
    }
    const updateData = req.body
    const result = await updatePropertyByAdmin(id, updateData)
    res.json(result)
  } catch (error) {
    console.error('Error updating property:', error)
    res.status(500).json({ error: 'Failed to update property' })
  }
}

export async function getAllUsersHandler(req: Request, res: Response): Promise<void> {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const searchTerm = typeof search === 'string' ? search : ''
    const result = await getUsersForAdmin(
      Number(page),
      Number(limit),
      searchTerm
    )
    res.json(result)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

export async function updateUserHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    if (!id) {
      res.status(400).json({ error: 'User ID is required' })
      return
    }
    const updateData = req.body
    const result = await updateUserByAdmin(id, updateData)
    res.json(result)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
}

export async function getAnalyticsDataHandler(req: Request, res: Response): Promise<void> {
  try {
    const { days = 30 } = req.query
    const result = await getAnalyticsData(Number(days))
    res.json(result)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}

export async function getMonthlyTrendsHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await getMonthlyTrends()
    res.json(result)
  } catch (error) {
    console.error('Error fetching monthly trends:', error)
    res.status(500).json({ error: 'Failed to fetch monthly trends' })
  }
}

export async function getPendingApprovalsHandler(req: Request, res: Response): Promise<void> {
  try {
    const result = await getPendingApprovals()
    res.json(result)
  } catch (error) {
    console.error('Error fetching pending approvals:', error)
    res.status(500).json({ error: 'Failed to fetch pending approvals' })
  }
}

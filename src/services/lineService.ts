import api from '@/utils/api'
import type { Result, User } from '@/types'
import { request } from '@/utils/requestHelper'

export interface LineLoginResponse {
  loginUrl: string
}

export interface LineLoginCallbackRequest {
  code: string
  state: string
  redirectUri?: string
}

export interface LineSendMessageRequest {
  userId: string
  message: string
}

export interface LineBroadcastMessageRequest {
  message: string
}

export interface LineMulticastMessageRequest {
  userIds: string[]
  message: string
}

export class LineService {
  /**
   * 獲取LINE Login授權URL
   */
  async getLoginUrl(redirectUri: string): Promise<Result<string>> {
    return request<string>(() => api.get('/auth/line/login-url', {
      params: { redirectUri }
    }))
  }

  /**
   * 處理LINE Login回調
   */
  async processLoginCallback(req: LineLoginCallbackRequest): Promise<Result<User>> {
    return request<User>(() => api.post('/auth/line/callback', req))
  }

  /**
   * 發送訊息給指定用戶
   */
  async sendMessage(req: LineSendMessageRequest): Promise<Result<void>> {
    return request<void>(() => api.post('/auth/line/message/send', req))
  }

  /**
   * 發送廣播訊息
   */
  async sendBroadcastMessage(req: LineBroadcastMessageRequest): Promise<Result<void>> {
    return request<void>(() => api.post('/auth/line/message/broadcast', req))
  }

  /**
   * 發送群發訊息
   */
  async sendMulticastMessage(req: LineMulticastMessageRequest): Promise<Result<void>> {
    return request<void>(() => api.post('/auth/line/message/multicast', req))
  }

  /**
   * 開始LINE Login流程
   */
  async startLineLogin(): Promise<void> {
    try {
      const redirectUri = `${window.location.origin}/auth/line/callback`
      const response = await this.getLoginUrl(redirectUri)
      
      if (response.success && response.data) {
        console.log('LINE Login URL:', response.data)
        window.location.href = response.data
      } else {
        throw new Error(response.message || 'LINE登入失敗')
      }
    } catch (error) {
      console.error('LINE登入失敗:', error)
      throw error
    }
  }
  /**
   * 處理LINE Login回調頁面
   */
  async handleLoginCallback(code: string, state: string): Promise<User> {
    try {
      const redirectUri = `${window.location.origin}/auth/line/callback`
      const response = await this.processLoginCallback({
        code,
        state,
        redirectUri
      })

      if (response.success && response.data) {
        return response.data
      } else {
        throw new Error(response.message || 'LINE登入處理失敗')
      }
    } catch (error) {
      console.error('LINE登入回調處理失敗:', error)
      throw error
    }
  }
}

export const lineService = new LineService() 
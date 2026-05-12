'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const Logo = () => (
  <svg

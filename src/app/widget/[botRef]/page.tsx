'use client';

import { useParams } from 'next/navigation';
import ChatWindow from '@/features/bots/components/widget/ChatWindow';
export default function WidgetPage() { const { botRef } = useParams<{ botRef: string }>(); return <ChatWindow botRef={botRef}/>; }

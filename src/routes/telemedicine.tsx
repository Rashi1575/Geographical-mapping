import { createFileRoute } from '@tanstack/react-router'
// This imports the actual video calling UI file you created earlier
// @ts-ignore
import TelemedicinePage from '../components/healthcare/Telemedicine';

export const Route = createFileRoute('/telemedicine')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-4 min-h-screen bg-background text-foreground">
      {/* This renders your WebRTC video interface onto the webpage */}
      <TelemedicinePage />
    </div>
  )
}
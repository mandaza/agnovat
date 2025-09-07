declare module 'react-big-calendar/lib/addons/dragAndDrop' {
  import { ComponentType } from 'react'
  import { Calendar } from 'react-big-calendar'
  
  interface DragAndDropProps {
    onEventDrop?: (args: { event: any; start: Date; end: Date; allDay?: boolean }) => void
    onEventResize?: (args: { event: any; start: Date; end: Date }) => void
    onDragStart?: (args: { event: any }) => void
    resizable?: boolean
    draggableAccessor?: ((event: any) => boolean) | string | boolean
    resizableAccessor?: ((event: any) => boolean) | string | boolean
  }

  const withDragAndDrop: <T = {}>(
    Calendar: ComponentType<T>
  ) => ComponentType<T & DragAndDropProps>

  export default withDragAndDrop
}
export interface Time {
  hours: number
  minutes: number
  seconds: number
}

// WARNING: sometimes time can be undefined if not saved properly idb-keyval
export interface Timer {
  id: string
  name: string
  time: Time
  color: string
}

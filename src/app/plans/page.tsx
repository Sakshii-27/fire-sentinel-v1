// 'use client'

// import Head from 'next/head'
// import { useEffect, useRef, useState } from 'react'
// import dynamic from 'next/dynamic'

// // Declare Leaflet type without default import
// type LeafletType = typeof import('leaflet');
// let L: LeafletType | null = null;

// const Radius = dynamic(() => import('lucide-react').then(mod => mod.Radius), { ssr: false })

// export default function Home() {
//   const [currentTime, setCurrentTime] = useState('')
//   const [isLeafletReady, setIsLeafletReady] = useState(false);
//   const [showStructureMap, setShowStructureMap] = useState(false)
//   const [isManagingExits, setIsManagingExits] = useState(false)
//   const [isManagingLocations, setIsManagingLocations] = useState(false)
//   const [exitCount, setExitCount] = useState(0)
//   const [locationCount, setLocationCount] = useState(0)
//   const [showFireDropdown, setShowFireDropdown] = useState(false)
//   const [activeFireLocation, setActiveFireLocation] = useState<{ lat: number, lng: number, name: string } | null>(null)
//   const [demoOccupantsActive, setDemoOccupantsActive] = useState(false)
//   const [occupantCounts, setOccupantCounts] = useState({
//     total: 0,
//     staff: 0,
//     guests: 0,
//     evacuatedStaff: 0,
//     evacuatedGuests: 0,
//     stuckOccupants: 0,
//     deadOccupants: 0
//   })
//   const [emergencyStatus, setEmergencyStatus] = useState('Normal')
//   const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
//   const mapRef = useRef<HTMLDivElement>(null)
//   const leafletMapRef = useRef<any>(null)
//   const imageOverlayRef = useRef<L.ImageOverlay | null>(null)
//   const exitsLayerRef = useRef<L.LayerGroup | null>(null)
//   const locationsLayerRef = useRef<L.LayerGroup | null>(null)
//   const occupantsLayerRef = useRef<L.LayerGroup | null>(null)
//   const fireLayerRef = useRef<L.LayerGroup | null>(null)
//   const exitsRef = useRef<Array<{ marker: L.CircleMarker, wave: L.CircleMarker, animationId: number | null }>>([])
//   const locationsRef = useRef<Array<{ marker: L.CircleMarker, wave: L.CircleMarker, animationId: number | null, name: string }>>([])
//   const occupantsRef = useRef<Array<{ marker: L.CircleMarker, animationId: number | null, type: 'staff' | 'guest' }>>([])
//   const fireRef = useRef<{ circle: L.CircleMarker, animationId: number | null, radius: number } | null>(null)
//   const lastFireUpdateRef = useRef<number>(0)
//   const fireExpansionRate = 0.7 // pixels per second

//   // Load Leaflet on client side
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('leaflet').then((leaflet) => {
//         L = leaflet.default;
//         setIsLeafletReady(true);
//       });
//     }
//   }, []);

//   // Speed constants
//   const BASE_SPEED = 1.4
//   const EMERGENCY_SPEED = 2.8
//   const EXIT_REACH_DISTANCE = 5
//   const FIRE_DEATH_RADIUS = 100
//   const EXIT_DISABLE_RADIUS = 200

//   const isWallColor = (r: number, g: number, b: number) => {
//     return r < 50 && g < 50 && b < 50
//   }

//   const getPixelColor = async (lat: number, lng: number) => {
//     if (!leafletMapRef.current || !imageOverlayRef.current || !L) return { r: 255, g: 255, b: 255 }

//     try {
//       const canvas = document.createElement('canvas')
//       const ctx = canvas.getContext('2d')
//       if (!ctx) return { r: 255, g: 255, b: 255 }

//       const point = leafletMapRef.current.latLngToContainerPoint([lat, lng])
//       const img = new Image()
//       img.crossOrigin = 'Anonymous'
//       img.src = (imageOverlayRef.current as any)._url

//       await new Promise((resolve) => {
//         img.onload = resolve
//       })

//       canvas.width = img.width
//       canvas.height = img.height
//       ctx.drawImage(img, 0, 0)

//       const pixelX = Math.floor(point.x * (img.width / leafletMapRef.current.getContainer().offsetWidth))
//       const pixelY = Math.floor(point.y * (img.height / leafletMapRef.current.getContainer().offsetHeight))

//       const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data
//       return { r: pixelData[0], g: pixelData[1], b: pixelData[2] }
//     } catch {
//       return { r: 255, g: 255, b: 255 }
//     }
//   }

//   const isValidPosition = async (lat: number, lng: number) => {
//     const color = await getPixelColor(lat, lng)
//     return !isWallColor(color.r, color.g, color.b)
//   }

//   useEffect(() => {
//     const updateClock = () => {
//       const now = new Date()
//       const timeString = now.toLocaleTimeString()
//       setCurrentTime(timeString)
//     }

//     updateClock()
//     const intervalId = setInterval(updateClock, 1000)
//     return () => clearInterval(intervalId)
//   }, [])

//   useEffect(() => {
//     if (!mapRef.current || leafletMapRef.current || !L) return

//     const imageWidth = 1000
//     const imageHeight = 600
//     const bounds: L.LatLngBoundsExpression = [[0, 0], [imageHeight, imageWidth]]

//     const map = L.map(mapRef.current, {
//       crs: L.CRS.Simple,
//       minZoom: -2,
//       maxZoom: 2,
//       zoomSnap: 0.1,
//     })

//     const defaultImage = '/building-map.jpg'
//     const imageOverlay = L.imageOverlay(defaultImage, bounds).addTo(map)

//     exitsLayerRef.current = L.layerGroup().addTo(map)
//     locationsLayerRef.current = L.layerGroup().addTo(map)
//     occupantsLayerRef.current = L.layerGroup().addTo(map)
//     fireLayerRef.current = L.layerGroup().addTo(map)
//     imageOverlayRef.current = imageOverlay
//     map.fitBounds(bounds)
//     leafletMapRef.current = map

//     const savedExits = typeof window !== 'undefined' ? localStorage.getItem('savedExits') : null
//     if (savedExits) {
//       const exits = JSON.parse(savedExits)
//       setExitCount(exits.length)
//       exits.forEach((exit: any) => {
//         addExitToMap(exit.lat, exit.lng, exit.name, false)
//       })
//     }

//     const savedLocations = typeof window !== 'undefined' ? localStorage.getItem('savedLocations') : null
//     if (savedLocations) {
//       const locations = JSON.parse(savedLocations)
//       setLocationCount(locations.length)
//       locations.forEach((location: any) => {
//         addLocationToMap(location.lat, location.lng, location.name, false)
//       })
//     }

//     return () => {
//       exitsRef.current.forEach(exit => {
//         if (exit.animationId) cancelAnimationFrame(exit.animationId)
//       })
//       locationsRef.current.forEach(location => {
//         if (location.animationId) cancelAnimationFrame(location.animationId)
//       })
//       occupantsRef.current.forEach(occupant => {
//         if (occupant.animationId) cancelAnimationFrame(occupant.animationId)
//       })
//       if (fireRef.current?.animationId) cancelAnimationFrame(fireRef.current.animationId)
//       if (leafletMapRef.current) {
//         leafletMapRef.current.off('click')
//       }
//     }
//   }, [isLeafletLoaded])


//   useEffect(() => {
//     if (!exitsLayerRef.current) return

//     if (isManagingExits) {
//       exitsLayerRef.current.eachLayer((layer: any) => {
//         if (layer.options.className === 'exit-marker') {
//           layer.setStyle({ opacity: 1, fillOpacity: 0.8 })
//         } else if (layer.options.className === 'exit-wave') {
//           layer.setStyle({ opacity: 0 })
//         }
//       })
//       exitsRef.current.forEach(exit => {
//         if (!exit.animationId) {
//           animateBeacon(exit, 'exit')
//         }
//       })
//     } else {
//       exitsLayerRef.current.eachLayer((layer: any) => {
//         layer.setStyle({ opacity: 0, fillOpacity: 0 })
//       })
//       exitsRef.current.forEach(exit => {
//         if (exit.animationId) {
//           cancelAnimationFrame(exit.animationId)
//           exit.animationId = null
//         }
//       })
//     }
//   }, [isManagingExits])

//   useEffect(() => {
//     if (!locationsLayerRef.current) return

//     if (isManagingLocations) {
//       locationsLayerRef.current.eachLayer((layer: any) => {
//         if (layer.options.className === 'location-marker') {
//           layer.setStyle({ opacity: 1, fillOpacity: 0.8 })
//         } else if (layer.options.className === 'location-wave') {
//           layer.setStyle({ opacity: 0 })
//         }
//       })
//       locationsRef.current.forEach(location => {
//         if (!location.animationId) {
//           animateBeacon(location, 'location')
//         }
//       })
//     } else {
//       locationsLayerRef.current.eachLayer((layer: any) => {
//         layer.setStyle({ opacity: 0, fillOpacity: 0 })
//       })
//       locationsRef.current.forEach(location => {
//         if (location.animationId) {
//           cancelAnimationFrame(location.animationId)
//           location.animationId = null
//         }
//       })
//     }
//   }, [isManagingLocations])

//   useEffect(() => {
//     if (!fireLayerRef.current) return

//     if (activeFireLocation) {
//       setEmergencyStatus('Emergency')

//       fireLayerRef.current.clearLayers()
//       if (fireRef.current?.animationId) {
//         cancelAnimationFrame(fireRef.current.animationId)
//       }

//       const firePoint = leafletMapRef.current?.latLngToContainerPoint([activeFireLocation.lat, activeFireLocation.lng])
//       let deadStaff = 0
//       let deadGuests = 0

//       occupantsRef.current = occupantsRef.current.filter(occupant => {
//         const occupantPoint = leafletMapRef.current?.latLngToContainerPoint(occupant.marker.getLatLng())
//         if (!firePoint || !occupantPoint) return true

//         const distance = firePoint.distanceTo(occupantPoint)
//         if (distance <= FIRE_DEATH_RADIUS) {
//           if (occupant.type === 'staff') deadStaff++
//           else deadGuests++

//           if (occupant.animationId) cancelAnimationFrame(occupant.animationId)
//           occupantsLayerRef.current?.removeLayer(occupant.marker)
//           return false
//         }
//         return true
//       })

//       const disabledExits: L.CircleMarker[] = [];
//       exitsRef.current.forEach(exit => {
//         const exitPoint = leafletMapRef.current?.latLngToContainerPoint(exit.marker.getLatLng())
//         if (firePoint && exitPoint) {
//           const distance = firePoint.distanceTo(exitPoint)
//           if (distance <= EXIT_DISABLE_RADIUS) {
//             exit.marker.setStyle({
//               fillColor: '#888',
//               color: '#555'
//             })
//             disabledExits.push(exit.marker)
//           }
//         }
//       })

//       setOccupantCounts(prev => ({
//         ...prev,
//         deadOccupants: prev.deadOccupants + deadStaff + deadGuests,
//         total: prev.total - (deadStaff + deadGuests),
//         staff: Math.max(0, prev.staff - deadStaff),
//         guests: Math.max(0, prev.guests - deadGuests),
//         stuckOccupants: 0
//       }))

//       occupantsRef.current.forEach(occupant => {
//         if (occupant.animationId) cancelAnimationFrame(occupant.animationId)

//         const occupantLatLng = occupant.marker.getLatLng()
//         let nearestExit: { distance: number; latLng: L.LatLng | null } = {
//           distance: Infinity,
//           latLng: null
//         };

//         exitsRef.current.forEach(exit => {
//           if (!disabledExits.includes(exit.marker)) {
//             const exitLatLng = exit.marker.getLatLng()
//             const distance = leafletMapRef.current?.distance(occupantLatLng, exitLatLng) || Infinity
//             if (distance < nearestExit.distance) {
//               nearestExit = { distance, latLng: exitLatLng }
//             }
//           }
//         })

//         if (nearestExit.latLng) {
//           const targetLat = nearestExit.latLng.lat
//           const targetLng = nearestExit.latLng.lng
//           occupant.animationId = requestAnimationFrame(() =>
//             moveToExit(occupant.marker, occupantLatLng.lat, occupantLatLng.lng,
//               targetLat, targetLng, occupant.type)
//           )
//         } else {
//           setOccupantCounts(prev => ({
//             ...prev,
//             stuckOccupants: prev.stuckOccupants + 1
//           }))
//         }
//       })

//       const fireCircle = L.circleMarker([activeFireLocation.lat, activeFireLocation.lng], {
//         radius: 10,
//         fillColor: '#ff5722',
//         color: '#f44336',
//         weight: 2,
//         opacity: 1,
//         fillOpacity: 0.8,
//         className: 'fire-marker'
//       }).addTo(fireLayerRef.current)

//       let radius = 10
//       lastFireUpdateRef.current = performance.now()

//       const animateFire = (timestamp: number) => {
//         const now = performance.now()
//         const deltaTime = (now - lastFireUpdateRef.current) / 1000
//         lastFireUpdateRef.current = now

//         radius += fireExpansionRate * deltaTime
//         fireCircle.setRadius(radius)
//         fireRef.current!.radius = radius
//         fireRef.current!.animationId = requestAnimationFrame(animateFire)

//         checkOccupantsInFire([activeFireLocation.lat, activeFireLocation.lng], radius)
//       }

//       fireRef.current = {
//         circle: fireCircle,
//         animationId: requestAnimationFrame(animateFire),
//         radius: 10
//       }
//     } else {
//       exitsRef.current.forEach(exit => {
//         exit.marker.setStyle({
//           fillColor: '#4CAF50',
//           color: '#2E7D32'
//         })
//       })

//       setEmergencyStatus('Normal')
//       fireLayerRef.current.clearLayers()
//       if (fireRef.current?.animationId) {
//         cancelAnimationFrame(fireRef.current.animationId)
//         fireRef.current = null
//       }

//       setOccupantCounts(prev => ({
//         ...prev,
//         stuckOccupants: 0
//       }))
//     }
//   }, [activeFireLocation])

//   const checkOccupantsInFire = (fireLocation: [number, number], radius: number) => {
//     occupantsRef.current.forEach(occupant => {
//       const occupantLocation = occupant.marker.getLatLng()
//       const distance = leafletMapRef.current?.distance(fireLocation, [occupantLocation.lat, occupantLocation.lng]) || 0

//       if (distance < radius) {
//         setOccupantCounts(prev => ({
//           ...prev,
//           stuckOccupants: prev.stuckOccupants + 1
//         }))
//       }
//     })
//   }

//   const moveToExit = async (marker: L.CircleMarker, startLat: number, startLng: number, endLat: number, endLng: number, type: 'staff' | 'guest') => {
//     if (!leafletMapRef.current) return

//     const speed = activeFireLocation ? EMERGENCY_SPEED : BASE_SPEED
//     let currentLat = startLat
//     let currentLng = startLng

//     const distanceToExit = leafletMapRef.current.distance([startLat, startLng], [endLat, endLng])
//     const duration = (distanceToExit / speed) * 1000

//     let startTime: number | null = null

//     const step = async (timestamp: number) => {
//       if (!startTime) startTime = timestamp
//       const elapsed = timestamp - startTime
//       const progress = Math.min(elapsed / duration, 1)

//       currentLat = startLat + (endLat - startLat) * progress
//       currentLng = startLng + (endLng - startLng) * progress

//       const currentDistance = leafletMapRef.current?.distance([currentLat, currentLng], [endLat, endLng]) || 0
//       if (currentDistance <= EXIT_REACH_DISTANCE) {
//         occupantsLayerRef.current?.removeLayer(marker)

//         setOccupantCounts(prev => {
//           const newCounts = { ...prev }
//           if (type === 'staff') {
//             newCounts.evacuatedStaff += 1
//             newCounts.staff = Math.max(0, prev.staff - 1)
//           } else {
//             newCounts.evacuatedGuests += 1
//             newCounts.guests = Math.max(0, prev.guests - 1)
//           }
//           newCounts.total = Math.max(0, prev.total - 1)
//           return newCounts
//         })

//         occupantsRef.current = occupantsRef.current.filter(o => o.marker !== marker)
//         return
//       }

//       const currentValid = await isValidPosition(currentLat, currentLng)
//       if (!currentValid) {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = requestAnimationFrame(() =>
//             moveToExit(marker, currentLat, currentLng, endLat, endLng, type)
//           )
//         }
//         return
//       }

//       marker.setLatLng([currentLat, currentLng])

//       if (progress < 1) {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = requestAnimationFrame(step)
//         }
//       }
//     }

//     const occupant = occupantsRef.current.find(o => o.marker === marker)
//     if (occupant) {
//       occupant.animationId = requestAnimationFrame(step)
//     }
//   }

//   const moveOccupant = async (marker: L.CircleMarker, startLat: number, startLng: number) => {
//     if (!leafletMapRef.current) return

//     const speed = BASE_SPEED
//     const maxDistance = 50
//     const moveInterval = 10000 + Math.random() * 15000

//     let attempts = 0
//     let targetLat, targetLng
//     let validPosition = false

//     while (!validPosition && attempts < 10) {
//       const angle = Math.random() * Math.PI * 2
//       const distance = Math.random() * maxDistance
//       targetLat = startLat + Math.sin(angle) * distance
//       targetLng = startLng + Math.cos(angle) * distance

//       validPosition = await isValidPosition(targetLat, targetLng)
//       attempts++
//     }

//     if (!validPosition) {
//       const occupant = occupantsRef.current.find(o => o.marker === marker)
//       if (occupant) {
//         occupant.animationId = setTimeout(() => {
//           occupant.animationId = requestAnimationFrame(() => moveOccupant(marker, startLat, startLng))
//         }, moveInterval) as unknown as number
//       }
//       return
//     }

//     let startTime: number | null = null
//     const duration = Math.sqrt(Math.pow(targetLat! - startLat, 2) + Math.pow(targetLng! - startLng, 2)) / speed * 1000

//     const step = async (timestamp: number) => {
//       if (!startTime) startTime = timestamp
//       const elapsed = timestamp - startTime
//       const progress = Math.min(elapsed / duration, 1)

//       const currentLat = startLat + (targetLat! - startLat) * progress
//       const currentLng = startLng + (targetLng! - startLng) * progress

//       const currentValid = await isValidPosition(currentLat, currentLng)
//       if (!currentValid) {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = setTimeout(() => {
//             occupant.animationId = requestAnimationFrame(() => moveOccupant(marker, startLat, startLng))
//           }, moveInterval) as unknown as number
//         }
//         return
//       }

//       marker.setLatLng([currentLat, currentLng])

//       if (progress < 1) {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = requestAnimationFrame(step)
//         }
//       } else {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = setTimeout(() => {
//             occupant.animationId = requestAnimationFrame(() => moveOccupant(marker, targetLat!, targetLng!))
//           }, moveInterval) as unknown as number
//         }
//       }
//     }

//     const occupant = occupantsRef.current.find(o => o.marker === marker)
//     if (occupant) {
//       occupant.animationId = requestAnimationFrame(step)
//     }
//   }

//   const handleToggleMapImage = () => {
//     const bounds: L.LatLngBoundsExpression = [[0, 0], [600, 1000]]
//     const newImage = showStructureMap ? '/building-map.jpg' : '/structure-map.jpg'
//     setShowStructureMap(prev => !prev)

//     if (leafletMapRef.current && imageOverlayRef.current) {
//       imageOverlayRef.current.setUrl(newImage)
//       leafletMapRef.current.fitBounds(bounds)
//     }
//   }

//   const animateBeacon = (target: { marker: L.CircleMarker, wave: L.CircleMarker, animationId: number | null }, type: 'exit' | 'location') => {
//     if ((type === 'exit' && !isManagingExits) || (type === 'location' && !isManagingLocations)) return

//     let start: number | null = null
//     const duration = 700
//     const initialRadius = type === 'exit' ? 10 : 12
//     const maxRadius = type === 'exit' ? 20 : 24

//     const step = (timestamp: number) => {
//       if (!start) start = timestamp
//       const elapsed = timestamp - start
//       const progress = Math.min(elapsed / duration, 1)

//       const radius = initialRadius + (maxRadius - initialRadius) * progress
//       const opacity = 0.7 * (1 - progress)

//       target.wave.setRadius(radius)
//       target.wave.setStyle({ opacity })

//       if (progress < 1) {
//         target.animationId = requestAnimationFrame(step)
//       } else {
//         target.wave.setRadius(initialRadius)
//         target.wave.setStyle({ opacity: 0 })
//         setTimeout(() => {
//           if ((type === 'exit' && isManagingExits) || (type === 'location' && isManagingLocations)) {
//             start = null
//             target.animationId = requestAnimationFrame(step)
//           } else {
//             target.animationId = null
//           }
//         }, 100)
//       }
//     }

//     target.animationId = requestAnimationFrame(step)
//   }

//   const addExitToMap = (lat: number, lng: number, name: string, saveToStorage: boolean) => {
//     if (!exitsLayerRef.current) return

//     const exitMarker = L.circleMarker([lat, lng], {
//       radius: 10,
//       fillColor: '#4CAF50',
//       color: '#2E7D32',
//       weight: 3,
//       opacity: isManagingExits ? 1 : 0,
//       fillOpacity: isManagingExits ? 0.8 : 0,
//       className: 'exit-marker'
//     }).addTo(exitsLayerRef.current)

//     const wave = L.circleMarker([lat, lng], {
//       radius: 15,
//       fillColor: 'transparent',
//       color: '#4CAF50',
//       weight: 5,
//       opacity: 0,
//       fillOpacity: 0,
//       className: 'exit-wave'
//     }).addTo(exitsLayerRef.current)

//     const exitNumber = name.split(' ')[1]
//     const tooltipContent = `
//       <div style="
//         background: white;
//         border-radius: 4px;
//         padding: 4px 8px;
//         box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//         font-weight: bold;
//         color: #4CAF50;
//         text-align: center;
//       ">
//         <div>Exit</div>
//         <div>${exitNumber}</div>
//       </div>
//     `

//     exitMarker.bindTooltip(tooltipContent, {
//       permanent: isManagingExits,
//       direction: 'right',
//       className: 'exit-tooltip',
//       offset: [10, 0]
//     })

//     const exitObj = {
//       marker: exitMarker,
//       wave: wave,
//       animationId: null
//     }
//     exitsRef.current.push(exitObj)

//     if (isManagingExits) {
//       animateBeacon(exitObj, 'exit')
//     }

//     if (saveToStorage) {
//       const savedExits = localStorage.getItem('savedExits')
//       const exits = savedExits ? JSON.parse(savedExits) : []
//       exits.push({ lat, lng, name })
//       localStorage.setItem('savedExits', JSON.stringify(exits))
//       setExitCount(exits.length)
//     }
//   }

//   const addLocationToMap = (lat: number, lng: number, name: string, saveToStorage: boolean) => {
//     if (!locationsLayerRef.current) return

//     const locationMarker = L.circleMarker([lat, lng], {
//       radius: 12,
//       fillColor: '#FACC15',
//       color: '#EAB308',
//       weight: 3,
//       opacity: isManagingLocations ? 1 : 0,
//       fillOpacity: isManagingLocations ? 0.8 : 0,
//       className: 'location-marker'
//     }).addTo(locationsLayerRef.current)

//     const wave = L.circleMarker([lat, lng], {
//       radius: 12,
//       fillColor: 'transparent',
//       color: '#FACC15',
//       weight: 5,
//       opacity: 0,
//       fillOpacity: 0,
//       className: 'location-wave'
//     }).addTo(locationsLayerRef.current)

//     const labelContent = `
//       <div style="
//         background: white;
//         border-radius: 4px;
//         padding: 4px 8px;
//         box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//         font-weight: bold;
//         color: #EAB308;
//         text-align: center;
//       ">
//         ${name}
//       </div>
//     `

//     locationMarker.bindTooltip(labelContent, {
//       permanent: isManagingLocations,
//       direction: 'right',
//       className: 'location-tooltip',
//       offset: [10, 0]
//     })

//     const locationObj = {
//       marker: locationMarker,
//       wave: wave,
//       animationId: null,
//       name: name
//     }
//     locationsRef.current.push(locationObj)

//     if (isManagingLocations) {
//       animateBeacon(locationObj, 'location')
//     }

//     if (saveToStorage) {
//       const savedLocations = localStorage.getItem('savedLocations')
//       const locations = savedLocations ? JSON.parse(savedLocations) : []
//       locations.push({ lat, lng, name })
//       localStorage.setItem('savedLocations', JSON.stringify(locations))
//       setLocationCount(locations.length)
//     }
//   }

//   const handleDeleteLocation = (lat: number, lng: number) => {
//     if (!locationsLayerRef.current) return

//     const locationIndex = locationsRef.current.findIndex(
//       loc => loc.marker.getLatLng().lat === lat && loc.marker.getLatLng().lng === lng
//     )

//     if (locationIndex !== -1) {
//       const location = locationsRef.current[locationIndex]

//       locationsLayerRef.current.removeLayer(location.marker)
//       locationsLayerRef.current.removeLayer(location.wave)

//       locationsRef.current.splice(locationIndex, 1)

//       const savedLocations = localStorage.getItem('savedLocations')
//       if (savedLocations) {
//         const locations = JSON.parse(savedLocations)
//         const updatedLocations = locations.filter(
//           (loc: any) => !(loc.lat === lat && loc.lng === lng)
//         )
//         localStorage.setItem('savedLocations', JSON.stringify(updatedLocations))
//         setLocationCount(updatedLocations.length)
//       }
//     }
//   }

//   const handleAddExit = () => {
//     if (!leafletMapRef.current) return

//     const map = leafletMapRef.current
//     const clickHandler = (e: L.LeafletMouseEvent) => {
//       const newExitNumber = exitCount + 1
//       const exitName = Exit ${newExitNumber}

//       addExitToMap(e.latlng.lat, e.latlng.lng, exitName, true)
//       setExitCount(newExitNumber)
//       map.off('click', clickHandler)
//     }

//     map.on('click', clickHandler)
//   }

//   const handleAddLocation = () => {
//     if (!leafletMapRef.current) return

//     const locationName = prompt('Enter location name:')
//     if (!locationName) return

//     const map = leafletMapRef.current
//     const clickHandler = (e: L.LeafletMouseEvent) => {
//       addLocationToMap(e.latlng.lat, e.latlng.lng, locationName, true)
//       map.off('click', clickHandler)
//     }

//     map.on('click', clickHandler)
//   }

//   const handleManageExits = () => {
//     setIsManagingExits(prev => !prev)
//     setIsManagingLocations(false)
//   }

//   const handleManageLocations = () => {
//     setIsManagingLocations(prev => {
//       const newValue = !prev
//       if (newValue) {
//         locationsRef.current.forEach(location => {
//           const latlng = location.marker.getLatLng()
//           location.marker.off('click')
//           location.marker.on('click', () => handleDeleteLocation(latlng.lat, latlng.lng))
//         })
//       } else {
//         locationsRef.current.forEach(location => {
//           location.marker.off('click')
//         })
//       }
//       return newValue
//     })
//     setIsManagingExits(false)
//   }

//   const addDemoOccupants = async () => {
//     if (!leafletMapRef.current || !occupantsLayerRef.current) return

//     removeDemoOccupants()

//     const imageWidth = 1000
//     const imageHeight = 600
//     const rectWidth = 800
//     const rectHeight = 330

//     const centerX = imageWidth / 2
//     const centerY = imageHeight / 2
//     const minX = centerX - rectWidth / 2
//     const maxX = centerX + rectWidth / 2
//     const minY = centerY - rectHeight / 2
//     const maxY = centerY + rectHeight / 2

//     let staffCount = 0
//     let guestCount = 0
//     const totalOccupants = 60
//     const staffPercentage = 0.45
//     const staffTarget = Math.floor(totalOccupants * staffPercentage)

//     let occupantsCreated = 0
//     const maxAttempts = totalOccupants * 3

//     while (occupantsCreated < totalOccupants && occupantsCreated < maxAttempts) {
//       const lat = minY + Math.random() * rectHeight
//       const lng = minX + Math.random() * rectWidth

//       const validPosition = await isValidPosition(lat, lng)
//       if (!validPosition) continue

//       const isStaff = staffCount < staffTarget
//       const type: 'staff' | 'guest' = isStaff ? 'staff' : 'guest' // Explicit type annotation

//       if (isStaff) staffCount++
//       else guestCount++

//       const occupant = L.circleMarker([lat, lng], {
//         radius: 5,
//         fillColor: isStaff ? '#ef4444' : '#3b82f6',
//         color: isStaff ? '#dc2626' : '#1d4ed8',
//         weight: 1,
//         opacity: 1,
//         fillOpacity: 0.8,
//         className: 'occupant-marker'
//       }).addTo(occupantsLayerRef.current)

//       const occupantObj = {
//         marker: occupant,
//         animationId: requestAnimationFrame(() => moveOccupant(occupant, lat, lng)) as number | null,
//         type: type
//       }
//       occupantsRef.current.push(occupantObj)
//       occupantsCreated++
//     }

//     setDemoOccupantsActive(true)
//     setOccupantCounts({
//       total: occupantsCreated,
//       staff: staffCount,
//       guests: guestCount,
//       evacuatedStaff: 0,
//       evacuatedGuests: 0,
//       stuckOccupants: 0,
//       deadOccupants: 0
//     })
//   }

//   const removeDemoOccupants = () => {
//     if (!occupantsLayerRef.current) return

//     occupantsRef.current.forEach(occupant => {
//       if (occupant.animationId) {
//         cancelAnimationFrame(occupant.animationId)
//       }
//       occupantsLayerRef.current?.removeLayer(occupant.marker)
//     })
//     occupantsRef.current = []
//     setDemoOccupantsActive(false)
//     setOccupantCounts({
//       total: 0,
//       staff: 0,
//       guests: 0,
//       evacuatedStaff: 0,
//       evacuatedGuests: 0,
//       stuckOccupants: 0,
//       deadOccupants: 0
//     })
//   }

//   const startFireSimulation = (locationName: string) => {
//     const savedLocations = localStorage.getItem('savedLocations')
//     if (!savedLocations) return

//     const locations = JSON.parse(savedLocations)
//     const location = locations.find((loc: any) => loc.name === locationName)
//     if (location) {
//       setActiveFireLocation(location)
//     }
//     setShowFireDropdown(false)
//   }

//   const stopFireSimulation = () => {
//     setActiveFireLocation(null)
//   }

//   return (
//     <div>
//       <Head>
//         <title>FireSentinel - Building Fire Safety & Disaster Management</title>
//         <style jsx global>{`
//           .exit-marker, .location-marker, .occupant-marker, .fire-marker {
//             filter: drop-shadow(0 0 2px rgba(0,0,0,0.2));
//           }
//           .exit-wave, .location-wave {
//             pointer-events: none;
//             transition: all 0.1s linear;
//           }
//           .leaflet-container {
//             background-color: #f8fafc;
//           }
//           .exit-tooltip, .location-tooltip {
//             background: transparent !important;
//             border: none !important;
//             box-shadow: none !important;
//           }
//           .fire-dropdown {
//             position: absolute;
//             top: 100%;
//             left: 0;
//             background-color: white;
//             border: 1px solid #ccc;
//             border-radius: 4px;
//             z-index: 1000;
//             padding: 0.5rem;
//             min-width: 200px;
//           }
//           .fire-dropdown div {
//             padding: 0.5rem;
//             cursor: pointer;
//             border-bottom: 1px solid #eee;
//           }
//           .fire-dropdown div:hover {
//             background-color: #f5f5f5;
//           }
//           .status-indicator {
//             display: inline-block;
//             width: 12px;
//             height: 12px;
//             border-radius: 50%;
//             margin-right: 8px;
//           }
//           .status-normal {
//             color: #4CAF50;
//           }
//           .status-warning {
//             color: #FFC107;
//           }
//           .status-danger {
//             color: #F44336;
//           }
//           .control-buttons {
//             margin-top: 16px;
//             display: flex;
//             flex-wrap: wrap;
//             gap: 8px;
//           }
//           .control-buttons button {
//             padding: 10px;
//             border-radius: 8px;
//             border: none;
//             background-color: #3b82f6;
//             color: white;
//             cursor: pointer;
//             transition: background-color 0.2s;
//             margin: 4px 0;
//           }
//           .control-buttons button:hover {
//             background-color: #2563eb;
//           }
//           .control-buttons button.active {
//             background-color: #1d4ed8;
//             color: white;
//           }
//           .staff-dot {
//             background-color: #ef4444;
//           }
//           .guest-dot {
//             background-color: #3b82f6;
//           }
//           .status-list li {
//             display: flex;
//             align-items: center;
//             margin-bottom: 8px;
//             color: black;
//           }
//           .status-list li span:first-child {
//             flex: 1;
//           }
//           .status-list li span:last-child {
//             min-width: 40px;
//             text-align: right;
//           }
//           .clock {
//             color: black;
//             font-size: 1.2rem;
//             margin-bottom: 1rem;
//           }
//           .button-row {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 8px;
//             margin-top: 16px;
//           }
//           .button-row button {
//             padding: 10px;
//             border-radius: 8px;
//             border: none;
//             background-color: #3b82f6;
//             color: white;
//             cursor: pointer;
//             transition: background-color 0.2s;
//           }
//           .button-row button:hover {
//             background-color: #2563eb;
//           }
//           .button-row button.active {
//             background-color: #1d4ed8;
//           }
//         `}</style>
//       </Head>

//       <div className="header">
//         <div className="navbar">
//           <div className="logo" style={{ fontSize: '2rem', fontWeight: 'bold' }}>FireSentinel</div>
//           <div className="nav-links">
//             <a>Home</a>
//             <a>Features</a>
//             <a>Pricing</a>
//             <a>Contact</a>
//             <a>Login</a>
//           </div>
//         </div>
//         <div className="hero">
//           <h1>Advanced Fire Safety Monitoring System</h1>
//           <p>
//             Real-time occupant tracking and emergency response optimization to save lives during fire emergencies
//           </p>
//           <button className="get-started">Get Started</button>
//         </div>
//       </div>

//       <div className="dashboard">
//         <div className="card map-card">
//           <div className="card-title">Building Occupancy Map</div>
//           <div className="clock">{currentTime}</div>

//           <div
//             ref={mapRef}
//             style={{
//               height: '400px',
//               width: '100%',
//               borderRadius: '8px',
//               marginBottom: '1rem',
//               overflow: 'hidden'
//             }}
//           ></div>

//           <div className="button-row">
//             <button onClick={handleToggleMapImage}>
//               {showStructureMap ? 'Show Building Map' : 'Show Structure Map'}
//             </button>
//             <button onClick={handleAddExit}>
//               Add Exit
//             </button>
//             <button
//               onClick={handleManageExits}
//               className={isManagingExits ? 'active' : ''}
//             >
//               {isManagingExits ? 'Finish Managing' : 'Manage Exits'}
//             </button>
//             <button onClick={handleAddLocation}>
//               Add Location
//             </button>
//             <button
//               onClick={handleManageLocations}
//               className={isManagingLocations ? 'active' : ''}
//             >
//               {isManagingLocations ? 'Finish Managing' : 'Manage Locations'}
//             </button>
//           </div>
//         </div>

//         <div className="card status-card">
//           <div className="card-title">Building Status</div>
//           <ul className="status-list">
//             <li>
//               <span>Total Occupants:</span>
//               <span>{occupantCounts.total}</span>
//               <span className="status-indicator" style={{
//                 backgroundColor: occupantCounts.total > 0 ? '#3b82f6' : '#ccc'
//               }}></span>
//             </li>
//             <li>
//               <span>Staff:</span>
//               <span>{occupantCounts.staff}</span>
//               <span className="status-indicator staff-dot"></span>
//             </li>
//             <li>
//               <span>Guests:</span>
//               <span>{occupantCounts.guests}</span>
//               <span className="status-indicator guest-dot"></span>
//             </li>
//             <li>
//               <span>Evacuated Staff:</span>
//               <span>{occupantCounts.evacuatedStaff}</span>
//               <span className="status-indicator" style={{
//                 backgroundColor: occupantCounts.evacuatedStaff > 0 ? '#4CAF50' : '#ccc'
//               }}></span>
//             </li>
//             <li>
//               <span>Evacuated Guests:</span>
//               <span>{occupantCounts.evacuatedGuests}</span>
//               <span className="status-indicator" style={{
//                 backgroundColor: occupantCounts.evacuatedGuests > 0 ? '#4CAF50' : '#ccc'
//               }}></span>
//             </li>
//             <li>
//               <span>Stuck Occupants:</span>
//               <span>{occupantCounts.stuckOccupants}</span>
//               <span className="status-indicator" style={{
//                 backgroundColor: occupantCounts.stuckOccupants > 0 ? '#F44336' : '#ccc'
//               }}></span>
//             </li>
//             <li>
//               <span>Dead Occupants:</span>
//               <span>{occupantCounts.deadOccupants}</span>
//               <span className="status-indicator" style={{
//                 backgroundColor: occupantCounts.deadOccupants > 0 ? '#F44336' : '#ccc'
//               }}></span>
//             </li>
//             <li>
//               <span>Emergency Status:</span>
//               <span className={emergencyStatus === 'Emergency' ? 'status-danger' : 'status-normal'}>
//                 {emergencyStatus}
//               </span>
//             </li>
//           </ul>

//           <div className="control-buttons">
//             <button
//               onClick={demoOccupantsActive ? removeDemoOccupants : addDemoOccupants}
//               className={demoOccupantsActive ? 'active' : ''}
//               style={{
//                 background: "#228be6",
//                 color: "white",
//                 border: "none",
//                 padding: "0.5rem 0.8rem",
//                 borderRadius: "6px",
//                 fontSize: "0.85rem",
//                 cursor: "pointer",
//                 marginRight: "7px",


//               }}
//             >
//               {demoOccupantsActive ? 'Remove Occupants' : 'Add Occupants'}
//             </button>

//             {activeFireLocation ? (

//               <button
//                 onClick={stopFireSimulation}
//                 className="active"
//                 style={{
//                   background: "#228be6",
//                   color: "white",
//                   border: "none",
//                   padding: "0.5rem 0.8rem",
//                   borderRadius: "6px",
//                   fontSize: "0.85rem",
//                   cursor: "pointer",
//                 }}
//               >
//                 Stop Fire Simulation

//               </button>


//             ) : (
//               <div style={{ position: 'relative' }}>
//                 <button
//                   onClick={() => setShowFireDropdown(!showFireDropdown)}
//                   style={{
//                     background: "#228be6",
//                     color: "white",
//                     border: "none",
//                     padding: "0.5rem 0.8rem",
//                     borderRadius: "6px",
//                     fontSize: "0.85rem",
//                     cursor: "pointer",
//                     marginTop: "7px",

//                   }}
//                 >
//                   Simulate Fire
//                 </button>
//                 {showFireDropdown && (
//                   <div className="fire-dropdown"
//                     style={{
//                       background: "white",
//                       color: "black",
//                       border: "none",
//                       padding: "0.5rem 0.8rem",
//                       borderRadius: "6px",
//                       fontSize: "0.85rem",
//                       cursor: "pointer",
//                       marginTop: "7px",

//                     }}

//                   >
//                     {locationsRef.current.length > 0 ? (
//                       <>
//                         {locationsRef.current.map((location, index) => (
//                           <div
//                             key={index}
//                             onClick={() => startFireSimulation(location.name)}
//                           >
//                             {location.name}
//                           </div>
//                         ))}
//                       </>
//                     ) : (
//                       <div>No locations saved</div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// 'use client'

// import Head from 'next/head'
// import { useEffect, useRef, useState } from 'react'
// import dynamic from 'next/dynamic'

// // Declare Leaflet type without default import
// type LeafletType = typeof import('leaflet');
// let L: LeafletType | null = null;

// const Radius = dynamic(() => import('lucide-react').then(mod => mod.Radius), { ssr: false })

// export default function Home() {
//   const [currentTime, setCurrentTime] = useState('')
//   const [isLeafletReady, setIsLeafletReady] = useState(false);
//   const [showStructureMap, setShowStructureMap] = useState(false)
//   const [isManagingExits, setIsManagingExits] = useState(false)
//   const [isManagingLocations, setIsManagingLocations] = useState(false)
//   const [exitCount, setExitCount] = useState(0)
//   const [locationCount, setLocationCount] = useState(0)
//   const [showFireDropdown, setShowFireDropdown] = useState(false)
//   const [activeFireLocation, setActiveFireLocation] = useState<{ lat: number, lng: number, name: string } | null>(null)
//   const [demoOccupantsActive, setDemoOccupantsActive] = useState(false)
//   const [occupantCounts, setOccupantCounts] = useState({
//     total: 0,
//     staff: 0,
//     guests: 0,
//     evacuatedStaff: 0,
//     evacuatedGuests: 0,
//     stuckOccupants: 0,
//     deadOccupants: 0
//   })
//   const [emergencyStatus, setEmergencyStatus] = useState('Normal')
//   const [isLeafletLoaded, setIsLeafletLoaded] = useState(false)
//   const mapRef = useRef<HTMLDivElement>(null)
//   const leafletMapRef = useRef<any>(null)
//   const imageOverlayRef = useRef<L.ImageOverlay | null>(null)
//   const exitsLayerRef = useRef<L.LayerGroup | null>(null)
//   const locationsLayerRef = useRef<L.LayerGroup | null>(null)
//   const occupantsLayerRef = useRef<L.LayerGroup | null>(null)
//   const fireLayerRef = useRef<L.LayerGroup | null>(null)
//   const exitsRef = useRef<Array<{ marker: L.CircleMarker, wave: L.CircleMarker, animationId: number | null }>>([])
//   const locationsRef = useRef<Array<{ marker: L.CircleMarker, wave: L.CircleMarker, animationId: number | null, name: string }>>([])
//   const occupantsRef = useRef<Array<{ marker: L.CircleMarker, animationId: number | null, type: 'staff' | 'guest' }>>([])
//   const fireRef = useRef<{ circle: L.CircleMarker, animationId: number | null, radius: number } | null>(null)
//   const lastFireUpdateRef = useRef<number>(0)
//   const fireExpansionRate = 0.7 // pixels per second

//   // Load Leaflet on client side
//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       import('leaflet').then((leaflet) => {
//         L = leaflet.default;
//         setIsLeafletReady(true);
//       });
//     }
//   }, []);

//   // Speed constants
//   const BASE_SPEED = 1.4
//   const EMERGENCY_SPEED = 2.8
//   const EXIT_REACH_DISTANCE = 5
//   const FIRE_DEATH_RADIUS = 100
//   const EXIT_DISABLE_RADIUS = 200

//   const isWallColor = (r: number, g: number, b: number) => {
//     return r < 50 && g < 50 && b < 50
//   }

//   const getPixelColor = async (lat: number, lng: number) => {
//     if (!leafletMapRef.current || !imageOverlayRef.current || !L) return { r: 255, g: 255, b: 255 }

//     try {
//       const canvas = document.createElement('canvas')
//       const ctx = canvas.getContext('2d')
//       if (!ctx) return { r: 255, g: 255, b: 255 }

//       const point = leafletMapRef.current.latLngToContainerPoint([lat, lng])
//       const img = new Image()
//       img.crossOrigin = 'Anonymous'
//       img.src = (imageOverlayRef.current as any)._url

//       await new Promise((resolve) => {
//         img.onload = resolve
//       })

//       canvas.width = img.width
//       canvas.height = img.height
//       ctx.drawImage(img, 0, 0)

//       const pixelX = Math.floor(point.x * (img.width / leafletMapRef.current.getContainer().offsetWidth))
//       const pixelY = Math.floor(point.y * (img.height / leafletMapRef.current.getContainer().offsetHeight))

//       const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data
//       return { r: pixelData[0], g: pixelData[1], b: pixelData[2] }
//     } catch {
//       return { r: 255, g: 255, b: 255 }
//     }
//   }

//   const isValidPosition = async (lat: number, lng: number) => {
//     const color = await getPixelColor(lat, lng)
//     return !isWallColor(color.r, color.g, color.b)
//   }

//   useEffect(() => {
//     const updateClock = () => {
//       const now = new Date()
//       const timeString = now.toLocaleTimeString()
//       setCurrentTime(timeString)
//     }

//     updateClock()
//     const intervalId = setInterval(updateClock, 1000)
//     return () => clearInterval(intervalId)
//   }, [])

//   useEffect(() => {
//     if (!mapRef.current || leafletMapRef.current || !L) return

//     const imageWidth = 1000
//     const imageHeight = 600
//     const bounds: L.LatLngBoundsExpression = [[0, 0], [imageHeight, imageWidth]]

//     const map = L.map(mapRef.current, {
//       crs: L.CRS.Simple,
//       minZoom: -2,
//       maxZoom: 2,
//       zoomSnap: 0.1,
//     })

//     const defaultImage = '/building-map.jpg'
//     const imageOverlay = L.imageOverlay(defaultImage, bounds).addTo(map)

//     exitsLayerRef.current = L.layerGroup().addTo(map)
//     locationsLayerRef.current = L.layerGroup().addTo(map)
//     occupantsLayerRef.current = L.layerGroup().addTo(map)
//     fireLayerRef.current = L.layerGroup().addTo(map)
//     imageOverlayRef.current = imageOverlay
//     map.fitBounds(bounds)
//     leafletMapRef.current = map

//     const savedExits = typeof window !== 'undefined' ? localStorage.getItem('savedExits') : null
//     if (savedExits) {
//       const exits = JSON.parse(savedExits)
//       setExitCount(exits.length)
//       exits.forEach((exit: any) => {
//         addExitToMap(exit.lat, exit.lng, exit.name, false)
//       })
//     }

//     const savedLocations = typeof window !== 'undefined' ? localStorage.getItem('savedLocations') : null
//     if (savedLocations) {
//       const locations = JSON.parse(savedLocations)
//       setLocationCount(locations.length)
//       locations.forEach((location: any) => {
//         addLocationToMap(location.lat, location.lng, location.name, false)
//       })
//     }

//     return () => {
//       exitsRef.current.forEach(exit => {
//         if (exit.animationId) cancelAnimationFrame(exit.animationId)
//       })
//       locationsRef.current.forEach(location => {
//         if (location.animationId) cancelAnimationFrame(location.animationId)
//       })
//       occupantsRef.current.forEach(occupant => {
//         if (occupant.animationId) cancelAnimationFrame(occupant.animationId)
//       })
//       if (fireRef.current?.animationId) cancelAnimationFrame(fireRef.current.animationId)
//       if (leafletMapRef.current) {
//         leafletMapRef.current.off('click')
//       }
//     }
//   }, [isLeafletLoaded])

//   useEffect(() => {
//     if (!exitsLayerRef.current || !L) return

//     if (isManagingExits) {
//       exitsLayerRef.current.eachLayer((layer: any) => {
//         if (layer.options.className === 'exit-marker') {
//           layer.setStyle({ opacity: 1, fillOpacity: 0.8 })
//         } else if (layer.options.className === 'exit-wave') {
//           layer.setStyle({ opacity: 0 })
//         }
//       })
//       exitsRef.current.forEach(exit => {
//         if (!exit.animationId) {
//           animateBeacon(exit, 'exit')
//         }
//       })
//     } else {
//       exitsLayerRef.current.eachLayer((layer: any) => {
//         layer.setStyle({ opacity: 0, fillOpacity: 0 })
//       })
//       exitsRef.current.forEach(exit => {
//         if (exit.animationId) {
//           cancelAnimationFrame(exit.animationId)
//           exit.animationId = null
//         }
//       })
//     }
//   }, [isManagingExits])

//   useEffect(() => {
//     if (!locationsLayerRef.current || !L) return

//     if (isManagingLocations) {
//       locationsLayerRef.current.eachLayer((layer: any) => {
//         if (layer.options.className === 'location-marker') {
//           layer.setStyle({ opacity: 1, fillOpacity: 0.8 })
//         } else if (layer.options.className === 'location-wave') {
//           layer.setStyle({ opacity: 0 })
//         }
//       })
//       locationsRef.current.forEach(location => {
//         if (!location.animationId) {
//           animateBeacon(location, 'location')
//         }
//       })
//     } else {
//       locationsLayerRef.current.eachLayer((layer: any) => {
//         layer.setStyle({ opacity: 0, fillOpacity: 0 })
//       })
//       locationsRef.current.forEach(location => {
//         if (location.animationId) {
//           cancelAnimationFrame(location.animationId)
//           location.animationId = null
//         }
//       })
//     }
//   }, [isManagingLocations])

//   useEffect(() => {
//     if (!fireLayerRef.current || !L) return

//     if (activeFireLocation) {
//       setEmergencyStatus('Emergency')

//       fireLayerRef.current.clearLayers()
//       if (fireRef.current?.animationId) {
//         cancelAnimationFrame(fireRef.current.animationId)
//       }

//       const firePoint = leafletMapRef.current?.latLngToContainerPoint([activeFireLocation.lat, activeFireLocation.lng])
//       let deadStaff = 0
//       let deadGuests = 0

//       occupantsRef.current = occupantsRef.current.filter(occupant => {
//         const occupantPoint = leafletMapRef.current?.latLngToContainerPoint(occupant.marker.getLatLng())
//         if (!firePoint || !occupantPoint) return true

//         const distance = firePoint.distanceTo(occupantPoint)
//         if (distance <= FIRE_DEATH_RADIUS) {
//           if (occupant.type === 'staff') deadStaff++
//           else deadGuests++

//           if (occupant.animationId) cancelAnimationFrame(occupant.animationId)
//           occupantsLayerRef.current?.removeLayer(occupant.marker)
//           return false
//         }
//         return true
//       })

//       const disabledExits: L.CircleMarker[] = [];
//       exitsRef.current.forEach(exit => {
//         const exitPoint = leafletMapRef.current?.latLngToContainerPoint(exit.marker.getLatLng())
//         if (firePoint && exitPoint) {
//           const distance = firePoint.distanceTo(exitPoint)
//           if (distance <= EXIT_DISABLE_RADIUS) {
//             exit.marker.setStyle({
//               fillColor: '#888',
//               color: '#555'
//             })
//             disabledExits.push(exit.marker)
//           }
//         }
//       })

//       setOccupantCounts(prev => ({
//         ...prev,
//         deadOccupants: prev.deadOccupants + deadStaff + deadGuests,
//         total: prev.total - (deadStaff + deadGuests),
//         staff: Math.max(0, prev.staff - deadStaff),
//         guests: Math.max(0, prev.guests - deadGuests),
//         stuckOccupants: 0
//       }))

//       occupantsRef.current.forEach(occupant => {
//         if (occupant.animationId) cancelAnimationFrame(occupant.animationId)

//         const occupantLatLng = occupant.marker.getLatLng()
//         let nearestExit: { distance: number; latLng: L.LatLng | null } = {
//           distance: Infinity,
//           latLng: null
//         };

//         exitsRef.current.forEach(exit => {
//           if (!disabledExits.includes(exit.marker)) {
//             const exitLatLng = exit.marker.getLatLng()
//             const distance = leafletMapRef.current?.distance(occupantLatLng, exitLatLng) || Infinity
//             if (distance < nearestExit.distance) {
//               nearestExit = { distance, latLng: exitLatLng }
//             }
//           }
//         })

//         if (nearestExit.latLng) {
//           const targetLat = nearestExit.latLng.lat
//           const targetLng = nearestExit.latLng.lng
//           occupant.animationId = requestAnimationFrame(() =>
//             moveToExit(occupant.marker, occupantLatLng.lat, occupantLatLng.lng,
//               targetLat, targetLng, occupant.type)
//           )
//         } else {
//           setOccupantCounts(prev => ({
//             ...prev,
//             stuckOccupants: prev.stuckOccupants + 1
//           }))
//         }
//       })

//       const fireCircle = L.circleMarker([activeFireLocation.lat, activeFireLocation.lng], {
//         radius: 10,
//         fillColor: '#ff5722',
//         color: '#f44336',
//         weight: 2,
//         opacity: 1,
//         fillOpacity: 0.8,
//         className: 'fire-marker'
//       }).addTo(fireLayerRef.current)

//       let radius = 10
//       lastFireUpdateRef.current = performance.now()

//       const animateFire = (timestamp: number) => {
//         const now = performance.now()
//         const deltaTime = (now - lastFireUpdateRef.current) / 1000
//         lastFireUpdateRef.current = now

//         radius += fireExpansionRate * deltaTime
//         fireCircle.setRadius(radius)
//         fireRef.current!.radius = radius
//         fireRef.current!.animationId = requestAnimationFrame(animateFire)

//         checkOccupantsInFire([activeFireLocation.lat, activeFireLocation.lng], radius)
//       }

//       fireRef.current = {
//         circle: fireCircle,
//         animationId: requestAnimationFrame(animateFire),
//         radius: 10
//       }
//     } else {
//       exitsRef.current.forEach(exit => {
//         exit.marker.setStyle({
//           fillColor: '#4CAF50',
//           color: '#2E7D32'
//         })
//       })

//       setEmergencyStatus('Normal')
//       fireLayerRef.current.clearLayers()
//       if (fireRef.current?.animationId) {
//         cancelAnimationFrame(fireRef.current.animationId)
//         fireRef.current = null
//       }

//       setOccupantCounts(prev => ({
//         ...prev,
//         stuckOccupants: 0
//       }))
//     }
//   }, [activeFireLocation])

//   const checkOccupantsInFire = (fireLocation: [number, number], radius: number) => {
//     if (!leafletMapRef.current || !L) return

//     occupantsRef.current.forEach(occupant => {
//       const occupantLocation = occupant.marker.getLatLng()
//       const distance = leafletMapRef.current?.distance(fireLocation, [occupantLocation.lat, occupantLocation.lng]) || 0

//       if (distance < radius) {
//         setOccupantCounts(prev => ({
//           ...prev,
//           stuckOccupants: prev.stuckOccupants + 1
//         }))
//       }
//     })
//   }

//   const moveToExit = async (marker: L.CircleMarker, startLat: number, startLng: number, endLat: number, endLng: number, type: 'staff' | 'guest') => {
//     if (!leafletMapRef.current || !L) return

//     const speed = activeFireLocation ? EMERGENCY_SPEED : BASE_SPEED
//     let currentLat = startLat
//     let currentLng = startLng

//     const distanceToExit = leafletMapRef.current.distance([startLat, startLng], [endLat, endLng])
//     const duration = (distanceToExit / speed) * 1000

//     let startTime: number | null = null

//     const step = async (timestamp: number) => {
//       if (!startTime) startTime = timestamp
//       const elapsed = timestamp - startTime
//       const progress = Math.min(elapsed / duration, 1)

//       currentLat = startLat + (endLat - startLat) * progress
//       currentLng = startLng + (endLng - startLng) * progress

//       const currentDistance = leafletMapRef.current?.distance([currentLat, currentLng], [endLat, endLng]) || 0
//       if (currentDistance <= EXIT_REACH_DISTANCE) {
//         occupantsLayerRef.current?.removeLayer(marker)

//         setOccupantCounts(prev => {
//           const newCounts = { ...prev }
//           if (type === 'staff') {
//             newCounts.evacuatedStaff += 1
//             newCounts.staff = Math.max(0, prev.staff - 1)
//           } else {
//             newCounts.evacuatedGuests += 1
//             newCounts.guests = Math.max(0, prev.guests - 1)
//           }
//           newCounts.total = Math.max(0, prev.total - 1)
//           return newCounts
//         })

//         occupantsRef.current = occupantsRef.current.filter(o => o.marker !== marker)
//         return
//       }

//       const currentValid = await isValidPosition(currentLat, currentLng)
//       if (!currentValid) {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = requestAnimationFrame(() =>
//             moveToExit(marker, currentLat, currentLng, endLat, endLng, type)
//           )
//         }
//         return
//       }

//       marker.setLatLng([currentLat, currentLng])

//       if (progress < 1) {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = requestAnimationFrame(step)
//         }
//       }
//     }

//     const occupant = occupantsRef.current.find(o => o.marker === marker)
//     if (occupant) {
//       occupant.animationId = requestAnimationFrame(step)
//     }
//   }

//   const moveOccupant = async (marker: L.CircleMarker, startLat: number, startLng: number) => {
//     if (!leafletMapRef.current || !L) return

//     const speed = BASE_SPEED
//     const maxDistance = 50
//     const moveInterval = 10000 + Math.random() * 15000

//     let attempts = 0
//     let targetLat, targetLng
//     let validPosition = false

//     while (!validPosition && attempts < 10) {
//       const angle = Math.random() * Math.PI * 2
//       const distance = Math.random() * maxDistance
//       targetLat = startLat + Math.sin(angle) * distance
//       targetLng = startLng + Math.cos(angle) * distance

//       validPosition = await isValidPosition(targetLat, targetLng)
//       attempts++
//     }

//     if (!validPosition) {
//       const occupant = occupantsRef.current.find(o => o.marker === marker)
//       if (occupant) {
//         occupant.animationId = setTimeout(() => {
//           occupant.animationId = requestAnimationFrame(() => moveOccupant(marker, startLat, startLng))
//         }, moveInterval) as unknown as number
//       }
//       return
//     }

//     let startTime: number | null = null
//     const duration = Math.sqrt(Math.pow(targetLat! - startLat, 2) + Math.pow(targetLng! - startLng, 2)) / speed * 1000

//     const step = async (timestamp: number) => {
//       if (!startTime) startTime = timestamp
//       const elapsed = timestamp - startTime
//       const progress = Math.min(elapsed / duration, 1)

//       const currentLat = startLat + (targetLat! - startLat) * progress
//       const currentLng = startLng + (targetLng! - startLng) * progress

//       const currentValid = await isValidPosition(currentLat, currentLng)
//       if (!currentValid) {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = setTimeout(() => {
//             occupant.animationId = requestAnimationFrame(() => moveOccupant(marker, startLat, startLng))
//           }, moveInterval) as unknown as number
//         }
//         return
//       }

//       marker.setLatLng([currentLat, currentLng])

//       if (progress < 1) {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = requestAnimationFrame(step)
//         }
//       } else {
//         const occupant = occupantsRef.current.find(o => o.marker === marker)
//         if (occupant) {
//           occupant.animationId = setTimeout(() => {
//             occupant.animationId = requestAnimationFrame(() => moveOccupant(marker, targetLat!, targetLng!))
//           }, moveInterval) as unknown as number
//         }
//       }
//     }

//     const occupant = occupantsRef.current.find(o => o.marker === marker)
//     if (occupant) {
//       occupant.animationId = requestAnimationFrame(step)
//     }
//   }

//   const handleToggleMapImage = () => {
//     if (!leafletMapRef.current || !imageOverlayRef.current || !L) return

//     const bounds: L.LatLngBoundsExpression = [[0, 0], [600, 1000]]
//     const newImage = showStructureMap ? '/building-map.jpg' : '/structure-map.jpg'
//     setShowStructureMap(prev => !prev)

//     imageOverlayRef.current.setUrl(newImage)
//     leafletMapRef.current.fitBounds(bounds)
//   }

//   const animateBeacon = (target: { marker: L.CircleMarker, wave: L.CircleMarker, animationId: number | null }, type: 'exit' | 'location') => {
//     if ((type === 'exit' && !isManagingExits) || (type === 'location' && !isManagingLocations)) return

//     let start: number | null = null
//     const duration = 700
//     const initialRadius = type === 'exit' ? 10 : 12
//     const maxRadius = type === 'exit' ? 20 : 24

//     const step = (timestamp: number) => {
//       if (!start) start = timestamp
//       const elapsed = timestamp - start
//       const progress = Math.min(elapsed / duration, 1)

//       const radius = initialRadius + (maxRadius - initialRadius) * progress
//       const opacity = 0.7 * (1 - progress)

//       target.wave.setRadius(radius)
//       target.wave.setStyle({ opacity })

//       if (progress < 1) {
//         target.animationId = requestAnimationFrame(step)
//       } else {
//         target.wave.setRadius(initialRadius)
//         target.wave.setStyle({ opacity: 0 })
//         setTimeout(() => {
//           if ((type === 'exit' && isManagingExits) || (type === 'location' && isManagingLocations)) {
//             start = null
//             target.animationId = requestAnimationFrame(step)
//           } else {
//             target.animationId = null
//           }
//         }, 100)
//       }
//     }

//     target.animationId = requestAnimationFrame(step)
//   }

//   const addExitToMap = (lat: number, lng: number, name: string, saveToStorage: boolean) => {
//     if (!exitsLayerRef.current || !L) return

//     const exitMarker = L.circleMarker([lat, lng], {
//       radius: 10,
//       fillColor: '#4CAF50',
//       color: '#2E7D32',
//       weight: 3,
//       opacity: isManagingExits ? 1 : 0,
//       fillOpacity: isManagingExits ? 0.8 : 0,
//       className: 'exit-marker'
//     }).addTo(exitsLayerRef.current)

//     const wave = L.circleMarker([lat, lng], {
//       radius: 15,
//       fillColor: 'transparent',
//       color: '#4CAF50',
//       weight: 5,
//       opacity: 0,
//       fillOpacity: 0,
//       className: 'exit-wave'
//     }).addTo(exitsLayerRef.current)

//     const exitNumber = name.split(' ')[1]
//     const tooltipContent = `
//       <div style="
//         background: white;
//         border-radius: 4px;
//         padding: 4px 8px;
//         box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//         font-weight: bold;
//         color: #4CAF50;
//         text-align: center;
//       ">
//         <div>Exit</div>
//         <div>${exitNumber}</div>
//       </div>
//     `

//     exitMarker.bindTooltip(tooltipContent, {
//       permanent: isManagingExits,
//       direction: 'right',
//       className: 'exit-tooltip',
//       offset: [10, 0]
//     })

//     const exitObj = {
//       marker: exitMarker,
//       wave: wave,
//       animationId: null
//     }
//     exitsRef.current.push(exitObj)

//     if (isManagingExits) {
//       animateBeacon(exitObj, 'exit')
//     }

//     if (saveToStorage) {
//       const savedExits = localStorage.getItem('savedExits')
//       const exits = savedExits ? JSON.parse(savedExits) : []
//       exits.push({ lat, lng, name })
//       localStorage.setItem('savedExits', JSON.stringify(exits))
//       setExitCount(exits.length)
//     }
//   }

//   const addLocationToMap = (lat: number, lng: number, name: string, saveToStorage: boolean) => {
//     if (!locationsLayerRef.current || !L) return

//     const locationMarker = L.circleMarker([lat, lng], {
//       radius: 12,
//       fillColor: '#FACC15',
//       color: '#EAB308',
//       weight: 3,
//       opacity: isManagingLocations ? 1 : 0,
//       fillOpacity: isManagingLocations ? 0.8 : 0,
//       className: 'location-marker'
//     }).addTo(locationsLayerRef.current)

//     const wave = L.circleMarker([lat, lng], {
//       radius: 12,
//       fillColor: 'transparent',
//       color: '#FACC15',
//       weight: 5,
//       opacity: 0,
//       fillOpacity: 0,
//       className: 'location-wave'
//     }).addTo(locationsLayerRef.current)

//     const labelContent = `
//       <div style="
//         background: white;
//         border-radius: 4px;
//         padding: 4px 8px;
//         box-shadow: 0 2px 4px rgba(0,0,0,0.2);
//         font-weight: bold;
//         color: #EAB308;
//         text-align: center;
//       ">
//         ${name}
//       </div>
//     `

//     locationMarker.bindTooltip(labelContent, {
//       permanent: isManagingLocations,
//       direction: 'right',
//       className: 'location-tooltip',
//       offset: [10, 0]
//     })

//     const locationObj = {
//       marker: locationMarker,
//       wave: wave,
//       animationId: null,
//       name: name
//     }
//     locationsRef.current.push(locationObj)

//     if (isManagingLocations) {
//       animateBeacon(locationObj, 'location')
//     }

//     if (saveToStorage) {
//       const savedLocations = localStorage.getItem('savedLocations')
//       const locations = savedLocations ? JSON.parse(savedLocations) : []
//       locations.push({ lat, lng, name })
//       localStorage.setItem('savedLocations', JSON.stringify(locations))
//       setLocationCount(locations.length)
//     }
//   }

//   const handleDeleteLocation = (lat: number, lng: number) => {
//     if (!locationsLayerRef.current || !L) return

//     const locationIndex = locationsRef.current.findIndex(
//       loc => loc.marker.getLatLng().lat === lat && loc.marker.getLatLng().lng === lng
//     )

//     if (locationIndex !== -1) {
//       const location = locationsRef.current[locationIndex]

//       locationsLayerRef.current.removeLayer(location.marker)
//       locationsLayerRef.current.removeLayer(location.wave)

//       locationsRef.current.splice(locationIndex, 1)

//       const savedLocations = localStorage.getItem('savedLocations')
//       if (savedLocations) {
//         const locations = JSON.parse(savedLocations)
//         const updatedLocations = locations.filter(
//           (loc: any) => !(loc.lat === lat && loc.lng === lng)
//         )
//         localStorage.setItem('savedLocations', JSON.stringify(updatedLocations))
//         setLocationCount(updatedLocations.length)
//       }
//     }
//   }

//   const handleAddExit = () => {
//     if (!leafletMapRef.current || !L) return

//     const map = leafletMapRef.current
//     const clickHandler = (e: L.LeafletMouseEvent) => {
//       const newExitNumber = exitCount + 1
//       const exitName = `Exit ${newExitNumber}`

//       addExitToMap(e.latlng.lat, e.latlng.lng, exitName, true)
//       setExitCount(newExitNumber)
//       map.off('click', clickHandler)
//     }

//     map.on('click', clickHandler)
//   }

//   const handleAddLocation = () => {
//     if (!leafletMapRef.current || !L) return

//     const locationName = prompt('Enter location name:')
//     if (!locationName) return

//     const map = leafletMapRef.current
//     const clickHandler = (e: L.LeafletMouseEvent) => {
//       addLocationToMap(e.latlng.lat, e.latlng.lng, locationName, true)
//       map.off('click', clickHandler)
//     }

//     map.on('click', clickHandler)
//   }

//   const handleManageExits = () => {
//     setIsManagingExits(prev => !prev)
//     setIsManagingLocations(false)
//   }

//   const handleManageLocations = () => {
//     setIsManagingLocations(prev => {
//       const newValue = !prev
//       if (newValue) {
//         locationsRef.current.forEach(location => {
//           const latlng = location.marker.getLatLng()
//           location.marker.off('click')
//           location.marker.on('click', () => handleDeleteLocation(latlng.lat, latlng.lng))
//         })
//       } else {
//         locationsRef.current.forEach(location => {
//           location.marker.off('click')
//         })
//       }
//       return newValue
//     })
//     setIsManagingExits(false)
//   }

//   const addDemoOccupants = async () => {
//     if (!leafletMapRef.current || !occupantsLayerRef.current || !L) return

//     removeDemoOccupants()

//     const imageWidth = 1000
//     const imageHeight = 600
//     const rectWidth = 800
//     const rectHeight = 330

//     const centerX = imageWidth / 2
//     const centerY = imageHeight / 2
//     const minX = centerX - rectWidth / 2
//     const maxX = centerX + rectWidth / 2
//     const minY = centerY - rectHeight / 2
//     const maxY = centerY + rectHeight / 2

//     let staffCount = 0
//     let guestCount = 0
//     const totalOccupants = 60
//     const staffPercentage = 0.45
//     const staffTarget = Math.floor(totalOccupants * staffPercentage)

//     let occupantsCreated = 0
//     const maxAttempts = totalOccupants * 3

//     while (occupantsCreated < totalOccupants && occupantsCreated < maxAttempts) {
//       const lat = minY + Math.random() * rectHeight
//       const lng = minX + Math.random() * rectWidth

//       const validPosition = await isValidPosition(lat, lng)
//       if (!validPosition) continue

//       const isStaff = staffCount < staffTarget
//       const type: 'staff' | 'guest' = isStaff ? 'staff' : 'guest'

//       if (isStaff) staffCount++
//       else guestCount++

//       const occupant = L.circleMarker([lat, lng], {
//         radius: 5,
//         fillColor: isStaff ? '#ef4444' : '#3b82f6',
//         color: isStaff ? '#dc2626' : '#1d4ed8',
//         weight: 1,
//         opacity: 1,
//         fillOpacity: 0.8,
//         className: 'occupant-marker'
//       }).addTo(occupantsLayerRef.current)

//       const occupantObj = {
//         marker: occupant,
//         animationId: requestAnimationFrame(() => moveOccupant(occupant, lat, lng)) as number | null,
//         type: type
//       }
//       occupantsRef.current.push(occupantObj)
//       occupantsCreated++
//     }

//     setDemoOccupantsActive(true)
//     setOccupantCounts({
//       total: occupantsCreated,
//       staff: staffCount,
//       guests: guestCount,
//       evacuatedStaff: 0,
//       evacuatedGuests: 0,
//       stuckOccupants: 0,
//       deadOccupants: 0
//     })
//   }

//   const removeDemoOccupants = () => {
//     if (!occupantsLayerRef.current) return

//     occupantsRef.current.forEach(occupant => {
//       if (occupant.animationId) {
//         cancelAnimationFrame(occupant.animationId)
//       }
//       occupantsLayerRef.current?.removeLayer(occupant.marker)
//     })
//     occupantsRef.current = []
//     setDemoOccupantsActive(false)
//     setOccupantCounts({
//       total: 0,
//       staff: 0,
//       guests: 0,
//       evacuatedStaff: 0,
//       evacuatedGuests: 0,
//       stuckOccupants: 0,
//       deadOccupants: 0
//     })
//   }

//   const startFireSimulation = (locationName: string) => {
//     const savedLocations = localStorage.getItem('savedLocations')
//     if (!savedLocations) return

//     const locations = JSON.parse(savedLocations)
//     const location = locations.find((loc: any) => loc.name === locationName)
//     if (location) {
//       setActiveFireLocation(location)
//     }
//     setShowFireDropdown(false)
//   }

//   const stopFireSimulation = () => {
//     setActiveFireLocation(null)
//   }

//   return (
//     <div>
//     <Head>
//       <title>FireSentinel - Building Fire Safety & Disaster Management</title>
//       <style jsx global>{`
//         .exit-marker, .location-marker, .occupant-marker, .fire-marker {
//           filter: drop-shadow(0 0 2px rgba(0,0,0,0.2));
//         }
//         .exit-wave, .location-wave {
//           pointer-events: none;
//           transition: all 0.1s linear;
//         }
//         .leaflet-container {
//           background-color: #f8fafc;
//         }
//         .exit-tooltip, .location-tooltip {
//           background: transparent !important;
//           border: none !important;
//           box-shadow: none !important;
//         }
//         .fire-dropdown {
//           position: absolute;
//           top: 100%;
//           left: 0;
//           background-color: white;
//           border: 1px solid #ccc;
//           border-radius: 4px;
//           z-index: 1000;
//           padding: 0.5rem;
//           min-width: 200px;
//         }
//         .fire-dropdown div {
//           padding: 0.5rem;
//           cursor: pointer;
//           border-bottom: 1px solid #eee;
//         }
//         .fire-dropdown div:hover {
//           background-color: #f5f5f5;
//         }
//         .status-indicator {
//           display: inline-block;
//           width: 12px;
//           height: 12px;
//           border-radius: 50%;
//           margin-right: 8px;
//         }
//         .status-normal {
//           color: #4CAF50;
//         }
//         .status-warning {
//           color: #FFC107;
//         }
//         .status-danger {
//           color: #F44336;
//         }
//         .control-buttons {
//           margin-top: 16px;
//           display: flex;
//           flex-wrap: wrap;
//           gap: 8px;
//         }
//         .control-buttons button {
//           padding: 10px;
//           border-radius: 8px;
//           border: none;
//           background-color: #3b82f6;
//           color: white;
//           cursor: pointer;
//           transition: background-color 0.2s;
//           margin: 4px 0;
//         }
//         .control-buttons button:hover {
//           background-color: #2563eb;
//         }
//         .control-buttons button.active {
//           background-color: #1d4ed8;
//           color: white;
//         }
//         .staff-dot {
//           background-color: #ef4444;
//         }
//         .guest-dot {
//           background-color: #3b82f6;
//         }
//         .status-list li {
//           display: flex;
//           align-items: center;
//           margin-bottom: 8px;
//           color: black;
//         }
//         .status-list li span:first-child {
//           flex: 1;
//         }
//         .status-list li span:last-child {
//           min-width: 40px;
//           text-align: right;
//         }
//         .clock {
//           color: black;
//           font-size: 1.2rem;
//           margin-bottom: 1rem;
//         }
//         .button-row {
//           display: flex;
//           flex-wrap: wrap;
//           gap: 8px;
//           margin-top: 16px;
//         }
//         .button-row button {
//           padding: 10px;
//           border-radius: 8px;
//           border: none;
//           background-color: #3b82f6;
//           color: white;
//           cursor: pointer;
//           transition: background-color 0.2s;
//         }
//         .button-row button:hover {
//           background-color: #2563eb;
//         }
//         .button-row button.active {
//           background-color: #1d4ed8;
//         }
//       `}</style>
//     </Head>

//     <div className="header">
//       <div className="navbar">
//         <div className="logo" style={{ fontSize: '2rem', fontWeight: 'bold' }}>FireSentinel</div>
//         <div className="nav-links">
//           <a>Home</a>
//           <a>Features</a>
//           <a>Pricing</a>
//           <a>Contact</a>
//           <a>Login</a>
//         </div>
//       </div>
//       <div className="hero">
//         <h1>Advanced Fire Safety Monitoring System</h1>
//         <p>
//           Real-time occupant tracking and emergency response optimization to save lives during fire emergencies
//         </p>
//         <button className="get-started">Get Started</button>
//       </div>
//     </div>

//     <div className="dashboard">
//       <div className="card map-card">
//         <div className="card-title">Building Occupancy Map</div>
//         <div className="clock">{currentTime}</div>

//         <div
//           ref={mapRef}
//           style={{
//             height: '400px',
//             width: '100%',
//             borderRadius: '8px',
//             marginBottom: '1rem',
//             overflow: 'hidden'
//           }}
//         ></div>

//         <div className="button-row">
//           <button onClick={handleToggleMapImage}>
//             {showStructureMap ? 'Show Building Map' : 'Show Structure Map'}
//           </button>
//           <button onClick={handleAddExit}>
//             Add Exit
//           </button>
//           <button
//             onClick={handleManageExits}
//             className={isManagingExits ? 'active' : ''}
//           >
//             {isManagingExits ? 'Finish Managing' : 'Manage Exits'}
//           </button>
//           <button onClick={handleAddLocation}>
//             Add Location
//           </button>
//           <button
//             onClick={handleManageLocations}
//             className={isManagingLocations ? 'active' : ''}
//           >
//             {isManagingLocations ? 'Finish Managing' : 'Manage Locations'}
//           </button>
//         </div>
//       </div>

//       <div className="card status-card">
//         <div className="card-title">Building Status</div>
//         <ul className="status-list">
//           <li>
//             <span>Total Occupants:</span>
//             <span>{occupantCounts.total}</span>
//             <span className="status-indicator" style={{
//               backgroundColor: occupantCounts.total > 0 ? '#3b82f6' : '#ccc'
//             }}></span>
//           </li>
//           <li>
//             <span>Staff:</span>
//             <span>{occupantCounts.staff}</span>
//             <span className="status-indicator staff-dot"></span>
//           </li>
//           <li>
//             <span>Guests:</span>
//             <span>{occupantCounts.guests}</span>
//             <span className="status-indicator guest-dot"></span>
//           </li>
//           <li>
//             <span>Evacuated Staff:</span>
//             <span>{occupantCounts.evacuatedStaff}</span>
//             <span className="status-indicator" style={{
//               backgroundColor: occupantCounts.evacuatedStaff > 0 ? '#4CAF50' : '#ccc'
//             }}></span>
//           </li>
//           <li>
//             <span>Evacuated Guests:</span>
//             <span>{occupantCounts.evacuatedGuests}</span>
//             <span className="status-indicator" style={{
//               backgroundColor: occupantCounts.evacuatedGuests > 0 ? '#4CAF50' : '#ccc'
//             }}></span>
//           </li>
//           <li>
//             <span>Stuck Occupants:</span>
//             <span>{occupantCounts.stuckOccupants}</span>
//             <span className="status-indicator" style={{
//               backgroundColor: occupantCounts.stuckOccupants > 0 ? '#F44336' : '#ccc'
//             }}></span>
//           </li>
//           <li>
//             <span>Dead Occupants:</span>
//             <span>{occupantCounts.deadOccupants}</span>
//             <span className="status-indicator" style={{
//               backgroundColor: occupantCounts.deadOccupants > 0 ? '#F44336' : '#ccc'
//             }}></span>
//           </li>
//           <li>
//             <span>Emergency Status:</span>
//             <span className={emergencyStatus === 'Emergency' ? 'status-danger' : 'status-normal'}>
//               {emergencyStatus}
//             </span>
//           </li>
//         </ul>

//         <div className="control-buttons">
//           <button
//             onClick={demoOccupantsActive ? removeDemoOccupants : addDemoOccupants}
//             className={demoOccupantsActive ? 'active' : ''}
//             style={{
//               background: "#228be6",
//               color: "white",
//               border: "none",
//               padding: "0.5rem 0.8rem",
//               borderRadius: "6px",
//               fontSize: "0.85rem",
//               cursor: "pointer",
//               marginRight: "7px",


//             }}
//           >
//             {demoOccupantsActive ? 'Remove Occupants' : 'Add Occupants'}
//           </button>

//           {activeFireLocation ? (

//             <button
//               onClick={stopFireSimulation}
//               className="active"
//               style={{
//                 background: "#228be6",
//                 color: "white",
//                 border: "none",
//                 padding: "0.5rem 0.8rem",
//                 borderRadius: "6px",
//                 fontSize: "0.85rem",
//                 cursor: "pointer",
//               }}
//             >
//               Stop Fire Simulation

//             </button>


//           ) : (
//             <div style={{ position: 'relative' }}>
//               <button
//                 onClick={() => setShowFireDropdown(!showFireDropdown)}
//                 style={{
//                   background: "#228be6",
//                   color: "white",
//                   border: "none",
//                   padding: "0.5rem 0.8rem",
//                   borderRadius: "6px",
//                   fontSize: "0.85rem",
//                   cursor: "pointer",
//                   marginTop: "7px",

//                 }}
//               >
//                 Simulate Fire
//               </button>
//               {showFireDropdown && (
//                 <div className="fire-dropdown"
//                   style={{
//                     background: "white",
//                     color: "black",
//                     border: "none",
//                     padding: "0.5rem 0.8rem",
//                     borderRadius: "6px",
//                     fontSize: "0.85rem",
//                     cursor: "pointer",
//                     marginTop: "7px",

//                   }}

//                 >
//                   {locationsRef.current.length > 0 ? (
//                     <>
//                       {locationsRef.current.map((location, index) => (
//                         <div
//                           key={index}
//                           onClick={() => startFireSimulation(location.name)}
//                         >
//                           {location.name}
//                         </div>
//                       ))}
//                     </>
//                   ) : (
//                     <div>No locations saved</div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   </div>
// )
// }



'use client'

import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Types
type LeafletType = typeof import('leaflet')
type OccupantType = 'staff' | 'guest'
type Position = { lat: number; lng: number }
type FireLocation = Position & { name: string }
type ExitMarker = { marker: any; wave: any; animationId: number | null }
type LocationMarker = ExitMarker & { name: string }
type OccupantMarker = { marker: any; animationId: number | null; type: OccupantType }
type FireMarker = { circle: any; animationId: number | null; radius: number }

// Constants
const IMAGE_WIDTH = 1000
const IMAGE_HEIGHT = 600
const MAP_BOUNDS: [Position, Position] = [{ lat: 0, lng: 0 }, { lat: IMAGE_HEIGHT, lng: IMAGE_WIDTH }]
const BASE_SPEED = 1.4
const EMERGENCY_SPEED = 2.8
const EXIT_REACH_DISTANCE = 5
const FIRE_DEATH_RADIUS = 100
const EXIT_DISABLE_RADIUS = 200
const FIRE_EXPANSION_RATE = 0.7 // pixels per second
const DEMO_OCCUPANTS_COUNT = 60
const DEMO_STAFF_PERCENTAGE = 0.45

export default function FireSafetyDashboard() {
  // State
  const [currentTime, setCurrentTime] = useState('')
  const [isLeafletReady, setIsLeafletReady] = useState(false)
  const [showStructureMap, setShowStructureMap] = useState(false)
  const [isManagingExits, setIsManagingExits] = useState(false)
  const [isManagingLocations, setIsManagingLocations] = useState(false)
  const [exitCount, setExitCount] = useState(0)
  const [locationCount, setLocationCount] = useState(0)
  const [showFireDropdown, setShowFireDropdown] = useState(false)
  const [activeFireLocation, setActiveFireLocation] = useState<FireLocation | null>(null)
  const [demoOccupantsActive, setDemoOccupantsActive] = useState(false)
  const [emergencyStatus, setEmergencyStatus] = useState<'Normal' | 'Emergency'>('Normal')
  const [occupantCounts, setOccupantCounts] = useState({
    total: 0,
    staff: 0,
    guests: 0,
    evacuatedStaff: 0,
    evacuatedGuests: 0,
    stuckOccupants: 0,
    deadOccupants: 0
  })

  // Refs
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const imageOverlayRef = useRef<any>(null)
  const exitsLayerRef = useRef<any>(null)
  const locationsLayerRef = useRef<any>(null)
  const occupantsLayerRef = useRef<any>(null)
  const fireLayerRef = useRef<any>(null)
  const exitsRef = useRef<ExitMarker[]>([])
  const locationsRef = useRef<LocationMarker[]>([])
  const occupantsRef = useRef<OccupantMarker[]>([])
  const fireRef = useRef<FireMarker | null>(null)
  const lastFireUpdateRef = useRef<number>(0)

  // Load Leaflet asynchronously without CSS import
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadLeaflet = async () => {
        try {
          // Dynamically load Leaflet
          const L = await import('leaflet')
          
          // Manually inject Leaflet CSS (bypass module system)
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
          link.crossOrigin = ''
          document.head.appendChild(link)
          
          setIsLeafletReady(true)
        } catch (error) {
          console.error('Failed to load Leaflet:', error)
        }
      }
      
      loadLeaflet()
    }
  }, [])

  // Clock update effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString())
    }

    updateClock()
    const intervalId = setInterval(updateClock, 1000)
    return () => clearInterval(intervalId)
  }, [])

  // Initialize map and load saved data
  useEffect(() => {
    if (!isLeafletReady || !mapRef.current) return

    const initializeMap = async () => {
      const L = await import('leaflet')
      
      const map = L.map(mapRef.current!, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 2,
        zoomSnap: 0.1,
      })

      const defaultImage = '/building-map.jpg'
      const imageOverlay = L.imageOverlay(defaultImage, [
        [MAP_BOUNDS[0].lat, MAP_BOUNDS[0].lng],
        [MAP_BOUNDS[1].lat, MAP_BOUNDS[1].lng]
      ]).addTo(map)

      // Initialize layers
      exitsLayerRef.current = L.layerGroup().addTo(map)
      locationsLayerRef.current = L.layerGroup().addTo(map)
      occupantsLayerRef.current = L.layerGroup().addTo(map)
      fireLayerRef.current = L.layerGroup().addTo(map)
      
      imageOverlayRef.current = imageOverlay
      map.fitBounds([
        [MAP_BOUNDS[0].lat, MAP_BOUNDS[0].lng],
        [MAP_BOUNDS[1].lat, MAP_BOUNDS[1].lng]
      ])
      leafletMapRef.current = map

      // Load saved exits and locations
      try {
        const savedExits = localStorage.getItem('savedExits')
        if (savedExits) {
          const exits = JSON.parse(savedExits)
          setExitCount(exits.length)
          exits.forEach((exit: any) => {
            addExitToMap(exit.lat, exit.lng, exit.name, false)
          })
        }

        const savedLocations = localStorage.getItem('savedLocations')
        if (savedLocations) {
          const locations = JSON.parse(savedLocations)
          setLocationCount(locations.length)
          locations.forEach((location: any) => {
            addLocationToMap(location.lat, location.lng, location.name, false)
          })
        }
      } catch (error) {
        console.error('Error loading saved data:', error)
      }
    }

    initializeMap().catch(console.error)

    return () => {
      // Cleanup animations and map
      exitsRef.current.forEach(exit => exit.animationId && cancelAnimationFrame(exit.animationId))
      locationsRef.current.forEach(loc => loc.animationId && cancelAnimationFrame(loc.animationId))
      occupantsRef.current.forEach(occ => occ.animationId && cancelAnimationFrame(occ.animationId))
      if (fireRef.current?.animationId) cancelAnimationFrame(fireRef.current.animationId)
      if (leafletMapRef.current) leafletMapRef.current.off('click')
    }
  }, [isLeafletReady])

  // Helper functions
  const isWallColor = (r: number, g: number, b: number) => r < 50 && g < 50 && b < 50

  const getPixelColor = async (lat: number, lng: number) => {
    if (!leafletMapRef.current || !imageOverlayRef.current) return { r: 255, g: 255, b: 255 }

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return { r: 255, g: 255, b: 255 }

      const point = leafletMapRef.current.latLngToContainerPoint([lat, lng])
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = imageOverlayRef.current._url

      await new Promise((resolve) => { img.onload = resolve })

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const pixelX = Math.floor(point.x * (img.width / leafletMapRef.current.getContainer().offsetWidth))
      const pixelY = Math.floor(point.y * (img.height / leafletMapRef.current.getContainer().offsetHeight))

      const pixelData = ctx.getImageData(pixelX, pixelY, 1, 1).data
      return { r: pixelData[0], g: pixelData[1], b: pixelData[2] }
    } catch {
      return { r: 255, g: 255, b: 255 }
    }
  }

  const isValidPosition = async (lat: number, lng: number) => {
    const color = await getPixelColor(lat, lng)
    return !isWallColor(color.r, color.g, color.b)
  }

  // Map interaction functions
  const handleToggleMapImage = () => {
    if (!leafletMapRef.current || !imageOverlayRef.current) return

    const newImage = showStructureMap ? '/building-map.jpg' : '/structure-map.jpg'
    setShowStructureMap(!showStructureMap)
    imageOverlayRef.current.setUrl(newImage)
    leafletMapRef.current.fitBounds([
      [MAP_BOUNDS[0].lat, MAP_BOUNDS[0].lng],
      [MAP_BOUNDS[1].lat, MAP_BOUNDS[1].lng]
    ])
  }

  const animateBeacon = (target: any, type: 'exit' | 'location') => {
    if ((type === 'exit' && !isManagingExits) || (type === 'location' && !isManagingLocations)) return

    let start: number | null = null
    const duration = 700
    const initialRadius = type === 'exit' ? 10 : 12
    const maxRadius = type === 'exit' ? 20 : 24

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)

      const radius = initialRadius + (maxRadius - initialRadius) * progress
      const opacity = 0.7 * (1 - progress)

      target.wave.setRadius(radius)
      target.wave.setStyle({ opacity })

      if (progress < 1) {
        target.animationId = requestAnimationFrame(step)
      } else {
        target.wave.setRadius(initialRadius)
        target.wave.setStyle({ opacity: 0 })
        setTimeout(() => {
          if ((type === 'exit' && isManagingExits) || (type === 'location' && isManagingLocations)) {
            start = null
            target.animationId = requestAnimationFrame(step)
          } else {
            target.animationId = null
          }
        }, 100)
      }
    }

    target.animationId = requestAnimationFrame(step)
  }

  const addExitToMap = async (lat: number, lng: number, name: string, saveToStorage: boolean) => {
    if (!exitsLayerRef.current) return

    const L = await import('leaflet')
    const exitMarker = L.circleMarker([lat, lng], {
      radius: 10,
      fillColor: '#4CAF50',
      color: '#2E7D32',
      weight: 3,
      opacity: isManagingExits ? 1 : 0,
      fillOpacity: isManagingExits ? 0.8 : 0,
      className: 'exit-marker'
    }).addTo(exitsLayerRef.current)

    const wave = L.circleMarker([lat, lng], {
      radius: 15,
      fillColor: 'transparent',
      color: '#4CAF50',
      weight: 5,
      opacity: 0,
      fillOpacity: 0,
      className: 'exit-wave'
    }).addTo(exitsLayerRef.current)

    const exitNumber = name.split(' ')[1]
    const tooltipContent = `
      <div style="background: white; border-radius: 4px; padding: 4px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-weight: bold; color: #4CAF50; text-align: center;">
        <div>Exit</div>
        <div>${exitNumber}</div>
      </div>
    `

    exitMarker.bindTooltip(tooltipContent, {
      permanent: isManagingExits,
      direction: 'right',
      className: 'exit-tooltip',
      offset: [10, 0]
    })

    const exitObj = { marker: exitMarker, wave, animationId: null }
    exitsRef.current.push(exitObj)

    if (isManagingExits) animateBeacon(exitObj, 'exit')

    if (saveToStorage) {
      try {
        const savedExits = localStorage.getItem('savedExits') || '[]'
        const exits = JSON.parse(savedExits)
        exits.push({ lat, lng, name })
        localStorage.setItem('savedExits', JSON.stringify(exits))
        setExitCount(exits.length)
      } catch (error) {
        console.error('Error saving exit:', error)
      }
    }
  }

  const addLocationToMap = async (lat: number, lng: number, name: string, saveToStorage: boolean) => {
    if (!locationsLayerRef.current) return

    const L = await import('leaflet')
    const locationMarker = L.circleMarker([lat, lng], {
      radius: 12,
      fillColor: '#FACC15',
      color: '#EAB308',
      weight: 3,
      opacity: isManagingLocations ? 1 : 0,
      fillOpacity: isManagingLocations ? 0.8 : 0,
      className: 'location-marker'
    }).addTo(locationsLayerRef.current)

    const wave = L.circleMarker([lat, lng], {
      radius: 12,
      fillColor: 'transparent',
      color: '#FACC15',
      weight: 5,
      opacity: 0,
      fillOpacity: 0,
      className: 'location-wave'
    }).addTo(locationsLayerRef.current)

    const labelContent = `
      <div style="background: white; border-radius: 4px; padding: 4px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-weight: bold; color: #EAB308; text-align: center;">
        ${name}
      </div>
    `

    locationMarker.bindTooltip(labelContent, {
      permanent: isManagingLocations,
      direction: 'right',
      className: 'location-tooltip',
      offset: [10, 0]
    })

    const locationObj = { marker: locationMarker, wave, animationId: null, name }
    locationsRef.current.push(locationObj)

    if (isManagingLocations) {
      animateBeacon(locationObj, 'location')
      locationMarker.on('click', () => handleDeleteLocation(lat, lng))
    }

    if (saveToStorage) {
      try {
        const savedLocations = localStorage.getItem('savedLocations') || '[]'
        const locations = JSON.parse(savedLocations)
        locations.push({ lat, lng, name })
        localStorage.setItem('savedLocations', JSON.stringify(locations))
        setLocationCount(locations.length)
      } catch (error) {
        console.error('Error saving location:', error)
      }
    }
  }

  const handleDeleteLocation = (lat: number, lng: number) => {
    if (!locationsLayerRef.current) return

    const locationIndex = locationsRef.current.findIndex(
      loc => loc.marker.getLatLng().lat === lat && loc.marker.getLatLng().lng === lng
    )

    if (locationIndex !== -1) {
      const location = locationsRef.current[locationIndex]
      locationsLayerRef.current.removeLayer(location.marker)
      locationsLayerRef.current.removeLayer(location.wave)
      locationsRef.current.splice(locationIndex, 1)

      try {
        const savedLocations = localStorage.getItem('savedLocations')
        if (savedLocations) {
          const locations = JSON.parse(savedLocations)
          const updatedLocations = locations.filter(
            (loc: any) => !(loc.lat === lat && loc.lng === lng)
          )
          localStorage.setItem('savedLocations', JSON.stringify(updatedLocations))
          setLocationCount(updatedLocations.length)
        }
      } catch (error) {
        console.error('Error deleting location:', error)
      }
    }
  }

  const handleAddExit = async () => {
    if (!leafletMapRef.current) return

    const L = await import('leaflet')
    const map = leafletMapRef.current
    const clickHandler = (e: L.LeafletMouseEvent) => {
      const newExitNumber = exitCount + 1
      const exitName = `Exit ${newExitNumber}`
      addExitToMap(e.latlng.lat, e.latlng.lng, exitName, true)
      setExitCount(newExitNumber)
      map.off('click', clickHandler)
    }

    map.on('click', clickHandler)
  }

  const handleAddLocation = async () => {
    if (!leafletMapRef.current) return

    const locationName = prompt('Enter location name:')
    if (!locationName) return

    const L = await import('leaflet')
    const map = leafletMapRef.current
    const clickHandler = (e: L.LeafletMouseEvent) => {
      addLocationToMap(e.latlng.lat, e.latlng.lng, locationName, true)
      map.off('click', clickHandler)
    }

    map.on('click', clickHandler)
  }

  const handleManageExits = () => {
    setIsManagingExits(prev => !prev)
    setIsManagingLocations(false)
  }

  const handleManageLocations = () => {
    setIsManagingLocations(prev => !prev)
    setIsManagingExits(false)
  }

  const addDemoOccupants = async () => {
    if (!leafletMapRef.current || !occupantsLayerRef.current) return

    removeDemoOccupants()

    const L = await import('leaflet')
    const rectWidth = 800
    const rectHeight = 330
    const centerX = IMAGE_WIDTH / 2
    const centerY = IMAGE_HEIGHT / 2
    const minX = centerX - rectWidth / 2
    const maxX = centerX + rectWidth / 2
    const minY = centerY - rectHeight / 2
    const maxY = centerY + rectHeight / 2

    let staffCount = 0
    let guestCount = 0
    const staffTarget = Math.floor(DEMO_OCCUPANTS_COUNT * DEMO_STAFF_PERCENTAGE)

    let occupantsCreated = 0
    const maxAttempts = DEMO_OCCUPANTS_COUNT * 3

    while (occupantsCreated < DEMO_OCCUPANTS_COUNT && occupantsCreated < maxAttempts) {
      const lat = minY + Math.random() * rectHeight
      const lng = minX + Math.random() * rectWidth

      const validPosition = await isValidPosition(lat, lng)
      if (!validPosition) continue

      const isStaff = staffCount < staffTarget
      const type: OccupantType = isStaff ? 'staff' : 'guest'

      if (isStaff) staffCount++
      else guestCount++

      const occupant = L.circleMarker([lat, lng], {
        radius: 5,
        fillColor: isStaff ? '#ef4444' : '#3b82f6',
        color: isStaff ? '#dc2626' : '#1d4ed8',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8,
        className: 'occupant-marker'
      }).addTo(occupantsLayerRef.current)

      const occupantObj = {
        marker: occupant,
        animationId: requestAnimationFrame(() => moveOccupant(occupant, lat, lng)) as number | null,
        type
      }
      occupantsRef.current.push(occupantObj)
      occupantsCreated++
    }

    setDemoOccupantsActive(true)
    setOccupantCounts({
      total: occupantsCreated,
      staff: staffCount,
      guests: guestCount,
      evacuatedStaff: 0,
      evacuatedGuests: 0,
      stuckOccupants: 0,
      deadOccupants: 0
    })
  }

  const removeDemoOccupants = () => {
    if (!occupantsLayerRef.current) return

    occupantsRef.current.forEach(occupant => {
      if (occupant.animationId) cancelAnimationFrame(occupant.animationId)
      occupantsLayerRef.current?.removeLayer(occupant.marker)
    })
    occupantsRef.current = []
    setDemoOccupantsActive(false)
    setOccupantCounts({
      total: 0,
      staff: 0,
      guests: 0,
      evacuatedStaff: 0,
      evacuatedGuests: 0,
      stuckOccupants: 0,
      deadOccupants: 0
    })
  }

  const moveOccupant = async (marker: any, startLat: number, startLng: number) => {
    if (!leafletMapRef.current) return

    const L = await import('leaflet')
    const speed = BASE_SPEED
    const maxDistance = 50
    const moveInterval = 10000 + Math.random() * 15000

    let attempts = 0
    let targetLat, targetLng
    let validPosition = false

    while (!validPosition && attempts < 10) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * maxDistance
      targetLat = startLat + Math.sin(angle) * distance
      targetLng = startLng + Math.cos(angle) * distance

      validPosition = await isValidPosition(targetLat, targetLng)
      attempts++
    }

    if (!validPosition) {
      const occupant = occupantsRef.current.find(o => o.marker === marker)
      if (occupant) {
        occupant.animationId = setTimeout(() => {
          occupant.animationId = requestAnimationFrame(() => moveOccupant(marker, startLat, startLng))
        }, moveInterval) as unknown as number
      }
      return
    }

    let startTime: number | null = null
    const duration = Math.sqrt(Math.pow(targetLat! - startLat, 2) + Math.pow(targetLng! - startLng, 2)) / speed * 1000

    const step = async (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      const currentLat = startLat + (targetLat! - startLat) * progress
      const currentLng = startLng + (targetLng! - startLng) * progress

      const currentValid = await isValidPosition(currentLat, currentLng)
      if (!currentValid) {
        const occupant = occupantsRef.current.find(o => o.marker === marker)
        if (occupant) {
          occupant.animationId = setTimeout(() => {
            occupant.animationId = requestAnimationFrame(() => moveOccupant(marker, startLat, startLng))
          }, moveInterval) as unknown as number
        }
        return
      }

      marker.setLatLng([currentLat, currentLng])

      if (progress < 1) {
        const occupant = occupantsRef.current.find(o => o.marker === marker)
        if (occupant) {
          occupant.animationId = requestAnimationFrame(step)
        }
      } else {
        const occupant = occupantsRef.current.find(o => o.marker === marker)
        if (occupant) {
          occupant.animationId = setTimeout(() => {
            occupant.animationId = requestAnimationFrame(() => moveOccupant(marker, targetLat!, targetLng!))
          }, moveInterval) as unknown as number
        }
      }
    }

    const occupant = occupantsRef.current.find(o => o.marker === marker)
    if (occupant) {
      occupant.animationId = requestAnimationFrame(step)
    }
  }

  const moveToExit = async (marker: any, startLat: number, startLng: number, endLat: number, endLng: number, type: OccupantType) => {
    if (!leafletMapRef.current) return

    const L = await import('leaflet')
    const speed = activeFireLocation ? EMERGENCY_SPEED : BASE_SPEED
    let currentLat = startLat
    let currentLng = startLng

    const distanceToExit = leafletMapRef.current.distance([startLat, startLng], [endLat, endLng])
    const duration = (distanceToExit / speed) * 1000

    let startTime: number | null = null

    const step = async (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      currentLat = startLat + (endLat - startLat) * progress
      currentLng = startLng + (endLng - startLng) * progress

      const currentDistance = leafletMapRef.current?.distance([currentLat, currentLng], [endLat, endLng]) || 0
      if (currentDistance <= EXIT_REACH_DISTANCE) {
        occupantsLayerRef.current?.removeLayer(marker)

        setOccupantCounts(prev => {
          const newCounts = { ...prev }
          if (type === 'staff') {
            newCounts.evacuatedStaff += 1
            newCounts.staff = Math.max(0, prev.staff - 1)
          } else {
            newCounts.evacuatedGuests += 1
            newCounts.guests = Math.max(0, prev.guests - 1)
          }
          newCounts.total = Math.max(0, prev.total - 1)
          return newCounts
        })

        occupantsRef.current = occupantsRef.current.filter(o => o.marker !== marker)
        return
      }

      const currentValid = await isValidPosition(currentLat, currentLng)
      if (!currentValid) {
        const occupant = occupantsRef.current.find(o => o.marker === marker)
        if (occupant) {
          occupant.animationId = requestAnimationFrame(() =>
            moveToExit(marker, currentLat, currentLng, endLat, endLng, type)
          )
        }
        return
      }

      marker.setLatLng([currentLat, currentLng])

      if (progress < 1) {
        const occupant = occupantsRef.current.find(o => o.marker === marker)
        if (occupant) {
          occupant.animationId = requestAnimationFrame(step)
        }
      }
    }

    const occupant = occupantsRef.current.find(o => o.marker === marker)
    if (occupant) {
      occupant.animationId = requestAnimationFrame(step)
    }
  }

  const startFireSimulation = (locationName: string) => {
    try {
      const savedLocations = localStorage.getItem('savedLocations')
      if (!savedLocations) return

      const locations = JSON.parse(savedLocations)
      const location = locations.find((loc: any) => loc.name === locationName)
      if (location) {
        setActiveFireLocation(location)
      }
      setShowFireDropdown(false)
    } catch (error) {
      console.error('Error starting fire simulation:', error)
    }
  }

  const stopFireSimulation = () => {
    setActiveFireLocation(null)
  }

  // Effect for handling fire simulation
  useEffect(() => {
    if (!fireLayerRef.current || !isLeafletReady) return

    const handleFireSimulation = async () => {
      const L = await import('leaflet')
      
      if (activeFireLocation) {
        setEmergencyStatus('Emergency')

        fireLayerRef.current.clearLayers()
        if (fireRef.current?.animationId) {
          cancelAnimationFrame(fireRef.current.animationId)
        }

        const firePoint = leafletMapRef.current?.latLngToContainerPoint([activeFireLocation.lat, activeFireLocation.lng])
        let deadStaff = 0
        let deadGuests = 0

        occupantsRef.current = occupantsRef.current.filter(occupant => {
          const occupantPoint = leafletMapRef.current?.latLngToContainerPoint(occupant.marker.getLatLng())
          if (!firePoint || !occupantPoint) return true

          const distance = firePoint.distanceTo(occupantPoint)
          if (distance <= FIRE_DEATH_RADIUS) {
            if (occupant.type === 'staff') deadStaff++
            else deadGuests++

            if (occupant.animationId) cancelAnimationFrame(occupant.animationId)
            occupantsLayerRef.current?.removeLayer(occupant.marker)
            return false
          }
          return true
        })

        const disabledExits: any[] = []
        exitsRef.current.forEach(exit => {
          const exitPoint = leafletMapRef.current?.latLngToContainerPoint(exit.marker.getLatLng())
          if (firePoint && exitPoint) {
            const distance = firePoint.distanceTo(exitPoint)
            if (distance <= EXIT_DISABLE_RADIUS) {
              exit.marker.setStyle({
                fillColor: '#888',
                color: '#555'
              })
              disabledExits.push(exit.marker)
            }
          }
        })

        setOccupantCounts(prev => ({
          ...prev,
          deadOccupants: prev.deadOccupants + deadStaff + deadGuests,
          total: prev.total - (deadStaff + deadGuests),
          staff: Math.max(0, prev.staff - deadStaff),
          guests: Math.max(0, prev.guests - deadGuests),
          stuckOccupants: 0
        }))

        occupantsRef.current.forEach(occupant => {
          if (occupant.animationId) cancelAnimationFrame(occupant.animationId)

          const occupantLatLng = occupant.marker.getLatLng()
          let nearestExit: { distance: number; latLng: any } = {
            distance: Infinity,
            latLng: null
          }

          exitsRef.current.forEach(exit => {
            if (!disabledExits.includes(exit.marker)) {
              const exitLatLng = exit.marker.getLatLng()
              const distance = leafletMapRef.current?.distance(occupantLatLng, exitLatLng) || Infinity
              if (distance < nearestExit.distance) {
                nearestExit = { distance, latLng: exitLatLng }
              }
            }
          })

          if (nearestExit.latLng) {
            const targetLat = nearestExit.latLng.lat
            const targetLng = nearestExit.latLng.lng
            occupant.animationId = requestAnimationFrame(() =>
              moveToExit(occupant.marker, occupantLatLng.lat, occupantLatLng.lng, targetLat, targetLng, occupant.type)
            )
          } else {
            setOccupantCounts(prev => ({
              ...prev,
              stuckOccupants: prev.stuckOccupants + 1
            }))
          }
        })

        const fireCircle = L.circleMarker([activeFireLocation.lat, activeFireLocation.lng], {
          radius: 10,
          fillColor: '#ff5722',
          color: '#f44336',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
          className: 'fire-marker'
        }).addTo(fireLayerRef.current)

        let radius = 10
        lastFireUpdateRef.current = performance.now()

        const animateFire = (timestamp: number) => {
          const now = performance.now()
          const deltaTime = (now - lastFireUpdateRef.current) / 1000
          lastFireUpdateRef.current = now

          radius += FIRE_EXPANSION_RATE * deltaTime
          fireCircle.setRadius(radius)
          if (fireRef.current) fireRef.current.radius = radius
          fireRef.current!.animationId = requestAnimationFrame(animateFire)

          // Check occupants in fire
          occupantsRef.current.forEach(occupant => {
            const occupantLocation = occupant.marker.getLatLng()
            const distance = leafletMapRef.current?.distance(
              [activeFireLocation.lat, activeFireLocation.lng],
              [occupantLocation.lat, occupantLocation.lng]
            ) || 0

            if (distance < radius) {
              setOccupantCounts(prev => ({
                ...prev,
                stuckOccupants: prev.stuckOccupants + 1
              }))
            }
          })
        }

        fireRef.current = {
          circle: fireCircle,
          animationId: requestAnimationFrame(animateFire),
          radius: 10
        }
      } else {
        exitsRef.current.forEach(exit => {
          exit.marker.setStyle({
            fillColor: '#4CAF50',
            color: '#2E7D32'
          })
        })

        setEmergencyStatus('Normal')
        fireLayerRef.current.clearLayers()
        if (fireRef.current?.animationId) {
          cancelAnimationFrame(fireRef.current.animationId)
          fireRef.current = null
        }

        setOccupantCounts(prev => ({
          ...prev,
          stuckOccupants: 0
        }))
      }
    }

    handleFireSimulation().catch(console.error)
  }, [activeFireLocation, isLeafletReady])

  return (
    <div>
    <Head>
      <title>FireSentinel - Building Fire Safety & Disaster Management</title>
      <style jsx global>{`
        .exit-marker, .location-marker, .occupant-marker, .fire-marker {
          filter: drop-shadow(0 0 2px rgba(0,0,0,0.2));
        }
        .exit-wave, .location-wave {
          pointer-events: none;
          transition: all 0.1s linear;
        }
        .leaflet-container {
          background-color: #f8fafc;
        }
        .exit-tooltip, .location-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .fire-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          background-color: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          z-index: 1000;
          padding: 0.5rem;
          min-width: 200px;
        }
        .fire-dropdown div {
          padding: 0.5rem;
          cursor: pointer;
          border-bottom: 1px solid #eee;
        }
        .fire-dropdown div:hover {
          background-color: #f5f5f5;
        }
        .status-indicator {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .status-normal {
          color: #4CAF50;
        }
        .status-warning {
          color: #FFC107;
        }
        .status-danger {
          color: #F44336;
        }
        .control-buttons {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .control-buttons button {
          padding: 10px;
          border-radius: 8px;
          border: none;
          background-color: #3b82f6;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
          margin: 4px 0;
        }
        .control-buttons button:hover {
          background-color: #2563eb;
        }
        .control-buttons button.active {
          background-color: #1d4ed8;
          color: white;
        }
        .staff-dot {
          background-color: #ef4444;
        }
        .guest-dot {
          background-color: #3b82f6;
        }
        .status-list li {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          color: black;
        }
        .status-list li span:first-child {
          flex: 1;
        }
        .status-list li span:last-child {
          min-width: 40px;
          text-align: right;
        }
        .clock {
          color: black;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }
        .button-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }
        .button-row button {
          padding: 10px;
          border-radius: 8px;
          border: none;
          background-color: #3b82f6;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .button-row button:hover {
          background-color: #2563eb;
        }
        .button-row button.active {
          background-color: #1d4ed8;
        }
      `}</style>
    </Head>

    <div className="header">
      <div className="navbar">
        <div className="logo" style={{ fontSize: '2rem', fontWeight: 'bold' }}>FireSentinel</div>
        <div className="nav-links">
          <a>Home</a>
          <a>Features</a>
          <a>Pricing</a>
          <a>Contact</a>
          <a>Login</a>
        </div>
      </div>
      <div className="hero">
        <h1>Advanced Fire Safety Monitoring System</h1>
        <p>
          Real-time occupant tracking and emergency response optimization to save lives during fire emergencies
        </p>
        <button className="get-started">Get Started</button>
      </div>
    </div>

    <div className="dashboard">
      <div className="card map-card">
        <div className="card-title">Building Occupancy Map</div>
        <div className="clock">{currentTime}</div>

        <div
          ref={mapRef}
          style={{
            height: '400px',
            width: '100%',
            borderRadius: '8px',
            marginBottom: '1rem',
            overflow: 'hidden'
          }}
        ></div>

        <div className="button-row">
          <button onClick={handleToggleMapImage}>
            {showStructureMap ? 'Show Building Map' : 'Show Structure Map'}
          </button>
          <button onClick={handleAddExit}>
            Add Exit
          </button>
          <button
            onClick={handleManageExits}
            className={isManagingExits ? 'active' : ''}
          >
            {isManagingExits ? 'Finish Managing' : 'Manage Exits'}
          </button>
          <button onClick={handleAddLocation}>
            Add Location
          </button>
          <button
            onClick={handleManageLocations}
            className={isManagingLocations ? 'active' : ''}
          >
            {isManagingLocations ? 'Finish Managing' : 'Manage Locations'}
          </button>
        </div>
      </div>

      <div className="card status-card">
        <div className="card-title">Building Status</div>
        <ul className="status-list">
          <li>
            <span>Total Occupants:</span>
            <span>{occupantCounts.total}</span>
            <span className="status-indicator" style={{
              backgroundColor: occupantCounts.total > 0 ? '#3b82f6' : '#ccc'
            }}></span>
          </li>
          <li>
            <span>Staff:</span>
            <span>{occupantCounts.staff}</span>
            <span className="status-indicator staff-dot"></span>
          </li>
          <li>
            <span>Guests:</span>
            <span>{occupantCounts.guests}</span>
            <span className="status-indicator guest-dot"></span>
          </li>
          <li>
            <span>Evacuated Staff:</span>
            <span>{occupantCounts.evacuatedStaff}</span>
            <span className="status-indicator" style={{
              backgroundColor: occupantCounts.evacuatedStaff > 0 ? '#4CAF50' : '#ccc'
            }}></span>
          </li>
          <li>
            <span>Evacuated Guests:</span>
            <span>{occupantCounts.evacuatedGuests}</span>
            <span className="status-indicator" style={{
              backgroundColor: occupantCounts.evacuatedGuests > 0 ? '#4CAF50' : '#ccc'
            }}></span>
          </li>
          <li>
            <span>Stuck Occupants:</span>
            <span>{occupantCounts.stuckOccupants}</span>
            <span className="status-indicator" style={{
              backgroundColor: occupantCounts.stuckOccupants > 0 ? '#F44336' : '#ccc'
            }}></span>
          </li>
          <li>
            <span>Dead Occupants:</span>
            <span>{occupantCounts.deadOccupants}</span>
            <span className="status-indicator" style={{
              backgroundColor: occupantCounts.deadOccupants > 0 ? '#F44336' : '#ccc'
            }}></span>
          </li>
          <li>
            <span>Emergency Status:</span>
            <span className={emergencyStatus === 'Emergency' ? 'status-danger' : 'status-normal'}>
              {emergencyStatus}
            </span>
          </li>
        </ul>

        <div className="control-buttons">
          <button
            onClick={demoOccupantsActive ? removeDemoOccupants : addDemoOccupants}
            className={demoOccupantsActive ? 'active' : ''}
            style={{
              background: "#228be6",
              color: "white",
              border: "none",
              padding: "0.5rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.85rem",
              cursor: "pointer",
              marginRight: "7px",


            }}
          >
            {demoOccupantsActive ? 'Remove Occupants' : 'Add Occupants'}
          </button>

          {activeFireLocation ? (

            <button
              onClick={stopFireSimulation}
              className="active"
              style={{
                background: "#228be6",
                color: "white",
                border: "none",
                padding: "0.5rem 0.8rem",
                borderRadius: "6px",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Stop Fire Simulation

            </button>


          ) : (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowFireDropdown(!showFireDropdown)}
                style={{
                  background: "#228be6",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 0.8rem",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  marginTop: "7px",

                }}
              >
                Simulate Fire
              </button>
              {showFireDropdown && (
                <div className="fire-dropdown"
                  style={{
                    background: "white",
                    color: "black",
                    border: "none",
                    padding: "0.5rem 0.8rem",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    marginTop: "7px",

                  }}

                >
                  {locationsRef.current.length > 0 ? (
                    <>
                      {locationsRef.current.map((location, index) => (
                        <div
                          key={index}
                          onClick={() => startFireSimulation(location.name)}
                        >
                          {location.name}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div>No locations saved</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)
}

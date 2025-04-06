"use client"

import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'

export default function Home() {
  const [currentTime, setCurrentTime] = useState('')
  const [showStructureMap, setShowStructureMap] = useState(false)
  const [isManagingExits, setIsManagingExits] = useState(false)
  const [isManagingLocations, setIsManagingLocations] = useState(false)
  const [exitCount, setExitCount] = useState(0)
  const [locationCount, setLocationCount] = useState(0)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<any>(null)
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null)
  const exitsLayerRef = useRef<L.LayerGroup | null>(null)
  const locationsLayerRef = useRef<L.LayerGroup | null>(null)
  const exitsRef = useRef<Array<{marker: L.CircleMarker, wave: L.CircleMarker, animationId: number | null}>>([])
  const locationsRef = useRef<Array<{marker: L.CircleMarker, wave: L.CircleMarker, animationId: number | null, name: string}>>([])

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString()
      setCurrentTime(timeString)
    }

    updateClock()
    const intervalId = setInterval(updateClock, 1000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return

    const imageWidth = 1000
    const imageHeight = 600
    const bounds: L.LatLngBoundsExpression = [[0, 0], [imageHeight, imageWidth]]

    const map = L.map(mapRef.current, {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 2,
      zoomSnap: 0.1,
    })

    const defaultImage = '/building-map.jpg'
    const imageOverlay = L.imageOverlay(defaultImage, bounds).addTo(map)
    
    exitsLayerRef.current = L.layerGroup().addTo(map)
    locationsLayerRef.current = L.layerGroup().addTo(map)
    imageOverlayRef.current = imageOverlay
    map.fitBounds(bounds)
    leafletMapRef.current = map

    // Load saved exits
    const savedExits = localStorage.getItem('savedExits')
    if (savedExits) {
      const exits = JSON.parse(savedExits)
      setExitCount(exits.length)
      exits.forEach((exit: any) => {
        addExitToMap(exit.lat, exit.lng, exit.name, false)
      })
    }

    // Load saved locations
    const savedLocations = localStorage.getItem('savedLocations')
    if (savedLocations) {
      const locations = JSON.parse(savedLocations)
      setLocationCount(locations.length)
      locations.forEach((location: any) => {
        addLocationToMap(location.lat, location.lng, location.name, false)
      })
    }

    return () => {
      exitsRef.current.forEach(exit => {
        if (exit.animationId) cancelAnimationFrame(exit.animationId)
      })
      locationsRef.current.forEach(location => {
        if (location.animationId) cancelAnimationFrame(location.animationId)
      })
      if (leafletMapRef.current) {
        leafletMapRef.current.off('click')
      }
    }
  }, [])

  useEffect(() => {
    if (!exitsLayerRef.current) return

    if (isManagingExits) {
      exitsLayerRef.current.eachLayer((layer: any) => {
        if (layer.options.className === 'exit-marker') {
          layer.setStyle({ opacity: 1, fillOpacity: 0.8 })
        } else if (layer.options.className === 'exit-wave') {
          layer.setStyle({ opacity: 0 })
        }
      })
      exitsRef.current.forEach(exit => {
        if (!exit.animationId) {
          animateBeacon(exit, 'exit')
        }
      })
    } else {
      exitsLayerRef.current.eachLayer((layer: any) => {
        layer.setStyle({ opacity: 0, fillOpacity: 0 })
      })
      exitsRef.current.forEach(exit => {
        if (exit.animationId) {
          cancelAnimationFrame(exit.animationId)
          exit.animationId = null
        }
      })
    }
  }, [isManagingExits])

  useEffect(() => {
    if (!locationsLayerRef.current) return

    if (isManagingLocations) {
      locationsLayerRef.current.eachLayer((layer: any) => {
        if (layer.options.className === 'location-marker') {
          layer.setStyle({ opacity: 1, fillOpacity: 0.8 })
        } else if (layer.options.className === 'location-wave') {
          layer.setStyle({ opacity: 0 })
        }
      })
      locationsRef.current.forEach(location => {
        if (!location.animationId) {
          animateBeacon(location, 'location')
        }
      })
    } else {
      locationsLayerRef.current.eachLayer((layer: any) => {
        layer.setStyle({ opacity: 0, fillOpacity: 0 })
      })
      locationsRef.current.forEach(location => {
        if (location.animationId) {
          cancelAnimationFrame(location.animationId)
          location.animationId = null
        }
      })
    }
  }, [isManagingLocations])

  const handleToggleMapImage = () => {
    const bounds: L.LatLngBoundsExpression = [[0, 0], [600, 1000]]
    const newImage = showStructureMap ? '/building-map.jpg' : '/structure-map.jpg'
    setShowStructureMap(prev => !prev)

    if (leafletMapRef.current && imageOverlayRef.current) {
      imageOverlayRef.current.setUrl(newImage)
      leafletMapRef.current.fitBounds(bounds)
    }
  }

  const animateBeacon = (target: {marker: L.CircleMarker, wave: L.CircleMarker, animationId: number | null}, type: 'exit' | 'location') => {
    if ((type === 'exit' && !isManagingExits) || (type === 'location' && !isManagingLocations)) return

    let start: number | null = null
    const duration = 700 // 0.7 seconds per pulse
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

  const addExitToMap = (lat: number, lng: number, name: string, saveToStorage: boolean) => {
    if (!exitsLayerRef.current) return

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
      <div style="
        background: white;
        border-radius: 4px;
        padding: 4px 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        font-weight: bold;
        color: #4CAF50;
        text-align: center;
      ">
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

    const exitObj = {
      marker: exitMarker,
      wave: wave,
      animationId: null
    }
    exitsRef.current.push(exitObj)

    if (isManagingExits) {
      animateBeacon(exitObj, 'exit')
    }

    if (saveToStorage) {
      const savedExits = localStorage.getItem('savedExits')
      const exits = savedExits ? JSON.parse(savedExits) : []
      exits.push({ lat, lng, name })
      localStorage.setItem('savedExits', JSON.stringify(exits))
    }
  }

  const addLocationToMap = (lat: number, lng: number, name: string, saveToStorage: boolean) => {
    if (!locationsLayerRef.current) return

    // Yellow location marker
    const locationMarker = L.circleMarker([lat, lng], {
      radius: 12,
      fillColor: '#FACC15',
      color: '#EAB308',
      weight: 3,
      opacity: isManagingLocations ? 1 : 0,
      fillOpacity: isManagingLocations ? 0.8 : 0,
      className: 'location-marker'
    }).addTo(locationsLayerRef.current)

    // Location wave
    const wave = L.circleMarker([lat, lng], {
      radius: 12,
      fillColor: 'transparent',
      color: '#FACC15',
      weight: 5,
      opacity: 0,
      fillOpacity: 0,
      className: 'location-wave'
    }).addTo(locationsLayerRef.current)

    // Location label
    const labelContent = `
      <div style="
        background: white;
        border-radius: 4px;
        padding: 4px 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        font-weight: bold;
        color: #EAB308;
        text-align: center;
      ">
        ${name}
      </div>
    `

    locationMarker.bindTooltip(labelContent, {
      permanent: isManagingLocations,
      direction: 'right',
      className: 'location-tooltip',
      offset: [10, 0]
    })

    const locationObj = {
      marker: locationMarker,
      wave: wave,
      animationId: null,
      name: name
    }
    locationsRef.current.push(locationObj)

    if (isManagingLocations) {
      animateBeacon(locationObj, 'location')
    }

    if (saveToStorage) {
      const savedLocations = localStorage.getItem('savedLocations')
      const locations = savedLocations ? JSON.parse(savedLocations) : []
      locations.push({ lat, lng, name })
      localStorage.setItem('savedLocations', JSON.stringify(locations))
      setLocationCount(locations.length)
    }
  }

  const handleDeleteLocation = (lat: number, lng: number) => {
    if (!locationsLayerRef.current) return

    const locationIndex = locationsRef.current.findIndex(
      loc => loc.marker.getLatLng().lat === lat && loc.marker.getLatLng().lng === lng
    )
    
    if (locationIndex !== -1) {
      const location = locationsRef.current[locationIndex]
      
      // Remove from map
      locationsLayerRef.current.removeLayer(location.marker)
      locationsLayerRef.current.removeLayer(location.wave)
      
      // Remove from our ref array
      locationsRef.current.splice(locationIndex, 1)
      
      // Update localStorage
      const savedLocations = localStorage.getItem('savedLocations')
      if (savedLocations) {
        const locations = JSON.parse(savedLocations)
        const updatedLocations = locations.filter(
          (loc: any) => !(loc.lat === lat && loc.lng === lng)
        )
        localStorage.setItem('savedLocations', JSON.stringify(updatedLocations))
        setLocationCount(updatedLocations.length)
      }
    }
  }

  const handleAddExit = () => {
    if (!leafletMapRef.current) return

    const map = leafletMapRef.current
    const clickHandler = (e: L.LeafletMouseEvent) => {
      const nextExitNumber = exitCount + 1
      const exitName = `Exit ${nextExitNumber}`
      
      addExitToMap(e.latlng.lat, e.latlng.lng, exitName, true)
      setExitCount(nextExitNumber)
      map.off('click', clickHandler)
    }

    map.on('click', clickHandler)
  }

  const handleAddLocation = () => {
    if (!leafletMapRef.current) return

    const locationName = prompt('Enter location name:')
    if (!locationName) return

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
    setIsManagingLocations(prev => {
      const newValue = !prev
      if (newValue) {
        // Set up click handlers for deletion
        locationsRef.current.forEach(location => {
          const latlng = location.marker.getLatLng()
          location.marker.off('click')
          location.marker.on('click', () => handleDeleteLocation(latlng.lat, latlng.lng))
        })
      } else {
        // Remove click handlers
        locationsRef.current.forEach(location => {
          location.marker.off('click')
        })
      }
      return newValue
    })
    setIsManagingExits(false)
  }

  return (
    <div>
      <Head>
        <title>FireSentinel - Building Fire Safety & Disaster Management</title>
        <style jsx global>{`
          .exit-marker, .location-marker {
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
              See Structure and Exits
            </button>
            <button onClick={handleAddExit}>
              Add Exit
            </button>
            <button onClick={handleManageExits}>
              {isManagingExits ? 'Finish Managing' : 'Manage Exits'}
            </button>
            <button onClick={handleAddLocation}>
              Add Location
            </button>
            <button onClick={handleManageLocations}>
              {isManagingLocations ? 'Finish Managing' : 'Manage Locations'}
            </button>
          </div>
        </div>

        <div className="card status-card">
          <div className="card-title">Building Status</div>
          <ul className="status-list">
            {['Total Occupants', 'Staff', 'Guests', 'Evacuated Staff', 'Evacuated Guests', 'Stuck Occupants', 'Dead Occupants'].map((label, i) => (
              <li key={i}><span>{label}:</span><span>0</span></li>
            ))}
            <li><span>Emergency Status:</span><span className="status-normal">Normal</span></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
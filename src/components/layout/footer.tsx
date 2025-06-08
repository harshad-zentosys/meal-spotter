import React from 'react'

export default function Footer() {
  return (
    <footer className="rounded-xl relative overflow-hidden">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <p className="text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Meal'Spotter. All rights reserved.
        </p>
      </div>
    </footer>
  )
}   
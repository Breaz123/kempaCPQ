/**
 * 3D MDF Preview Component
 * 
 * Interactive 3D preview of MDF board with rotation and scaling capabilities.
 */

import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { CoatingSide } from '../../slices/configuration';
import * as THREE from 'three';

interface Mdf3DPreviewProps {
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  coatingSides: CoatingSide[];
  numberOfColors?: number;
}

// MDF Board component
function MdfBoard({ 
  lengthMm, 
  widthMm, 
  heightMm, 
  coatingSides,
  numberOfColors = 1 
}: Mdf3DPreviewProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convert mm to 3D units (scale down for visualization)
  // Using a scale factor to make it visible in 3D space
  const scale = 0.01; // 1mm = 0.01 units in 3D
  const length = lengthMm * scale;
  const width = widthMm * scale;
  const height = heightMm * scale;

  // Determine colors for each side based on coatingSides and numberOfColors
  const getSideColor = (side: CoatingSide): string => {
    if (!coatingSides.includes(side)) {
      return '#8B7355'; // Natural MDF brown color
    }
    
    // Generate colors based on numberOfColors
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#FFA07A', // Light Salmon
      '#98D8C8', // Mint
      '#F7DC6F', // Yellow
    ];
    
    const sideIndex = Object.values(CoatingSide).indexOf(side);
    const colorIndex = numberOfColors > 1 
      ? sideIndex % numberOfColors 
      : 0;
    
    return colors[colorIndex] || '#FF6B6B';
  };

  return (
    <group>
      {/* Main MDF board with different materials for each face */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[length, height, width]} />
        <meshStandardMaterial 
          color={getSideColor(CoatingSide.Front)}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Overlay planes for each side to show different colors */}
      {/* Front */}
      <mesh position={[0, 0, width / 2 + 0.001]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial 
          color={getSideColor(CoatingSide.Front)}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Back */}
      <mesh position={[0, 0, -width / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial 
          color={getSideColor(CoatingSide.Back)}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Top */}
      <mesh position={[0, height / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial 
          color={getSideColor(CoatingSide.Top)}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Bottom */}
      <mesh position={[0, -height / 2 - 0.001, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial 
          color={getSideColor(CoatingSide.Bottom)}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Left */}
      <mesh position={[-length / 2 - 0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          color={getSideColor(CoatingSide.Left)}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Right */}
      <mesh position={[length / 2 + 0.001, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial 
          color={getSideColor(CoatingSide.Right)}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

export function Mdf3DPreview({
  lengthMm,
  widthMm,
  heightMm,
  coatingSides,
  numberOfColors = 1
}: Mdf3DPreviewProps) {
  return (
    <div className="w-full h-[400px] rounded-lg border-2 border-[#D4C4B0] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[15, 10, 15]} fov={50} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} />
        <pointLight position={[0, 10, 0]} intensity={0.5} />
        
        <MdfBoard
          lengthMm={lengthMm}
          widthMm={widthMm}
          heightMm={heightMm}
          coatingSides={coatingSides}
          numberOfColors={numberOfColors}
        />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
        />
        
        {/* Grid helper for reference */}
        <gridHelper args={[30, 30, '#D4C4B0', '#E8DDD0']} />
      </Canvas>
      
      <div className="absolute bottom-2 left-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-md text-xs text-gray-600 z-10">
        <p>Sleep om te draaien • Scroll om in/uit te zoomen</p>
      </div>
    </div>
  );
}

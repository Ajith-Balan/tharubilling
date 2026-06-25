import React from 'react'
import { useSpring, animated } from 'react-spring'

const Progress = () => {
  
  const workers = useSpring({
    number: 120,
    from: { number: 0 },
    config: { duration: 2000 },
  });

  const workDone = useSpring({
    number: 600,
    from: { number: 0 },
    config: { duration: 2000 },
  });

  const countries = useSpring({
    number: 600,
    from: { number: 0 },
    config: { duration: 2000 },
  });

  const states = useSpring({
    number: 15,
    from: { number: 0 },
    config: { duration: 2000 },
  });


  const hoverSpring = useSpring({
    transform: 'scale(1)',
    from: { transform: 'scale(1)' },
    reset: true,
    reverse: true,
  });

  return (
    <div className="p-12 bg-[]">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 font-space-grotesk text-start text-teal-500">Our Progress</h2>
        <p className="text-lg text-gray-600 mb-12 font-space-grotesk text-start">
          A quick look at our key achievements. We're growing, and here's how!
        </p>
        <div className="grid md:grid-cols-4 gap-8 border">
                 <div className="text-center p-6 border" style={{ transition: 'transform 0.3s ease-in-out' }}>
            <animated.div style={hoverSpring}>
              <animated.h3 className="text-6xl font-semibold text-teal-500">
                               {workers.number.to(n => n.toFixed(0))}
              </animated.h3>
              <p className="text-lg text-gray-600">Workers</p>
            </animated.div>
          </div>
                   <div className="text-center p-6 border" style={{ transition: 'transform 0.3s ease-in-out' }}>
            <animated.div style={hoverSpring}>
              <animated.h3 className="text-6xl font-semibold text-teal-500">
                {workDone.number.to(n => n.toFixed(0))}
              </animated.h3>
              <p className="text-lg text-gray-600 font-space-grotesk">Total Work Done</p>
            </animated.div>
          </div>
               <div className="text-center p-6 border" style={{ transition: 'transform 0.3s ease-in-out' }}>
            <animated.div style={hoverSpring}>
              <animated.h3 className="text-6xl font-semibold text-teal-500">
                {countries.number.to(n => n.toFixed(0))}
              </animated.h3>
              <p className="text-lg text-gray-600 font-space-grotesk">Countries</p>
            </animated.div>
          </div>
                <div className="text-center p-6 border" style={{ transition: 'transform 0.3s ease-in-out' }}>
            <animated.div style={hoverSpring}>
              <animated.h3 className="text-6xl font-semibold text-teal-500">
                {states.number.to(n => n.toFixed(0))}
              </animated.h3>
              <p className="text-lg text-gray-600 font-space-grotesk">States</p>
            </animated.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Progress;

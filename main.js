const industries = {
  'life-sciences': {
    title: 'Life Sciences',
    subtitle: 'Innovative solutions for pharmaceutical and biotech industries',
    color: '#8b1a4a',
    heroBg: 'linear-gradient(135deg, #fdf5f8 0%, #f9eef4 100%)',
    solutions: [
      { name: 'Drug Discovery Platform', desc: 'AI-powered molecular analysis' },
      { name: 'Clinical Trial Management', desc: 'Streamline patient recruitment and data' },
      { name: 'Supply Chain Tracker', desc: 'Cold chain monitoring for biologics' },
      { name: 'Regulatory Compliance', desc: 'Automated documentation system' },
      { name: 'Patient Portal', desc: 'Secure health data management' },
      { name: 'Lab Analytics', desc: 'Real-time experiment tracking' },
    ]
  },
  'cpg': {
    title: 'CPG',
    subtitle: 'Consumer packaged goods solutions for modern retail',
    color: '#e07820',
    heroBg: 'linear-gradient(135deg, #fff8f0 0%, #fef3e2 100%)',
    solutions: [
      { name: 'Demand Forecasting', desc: 'Predictive analytics for inventory' },
      { name: 'Brand Performance', desc: 'Real-time market share analysis' },
      { name: 'Route Optimization', desc: 'Delivery efficiency tracking' },
      { name: 'Consumer Insights', desc: 'Sentiment analysis dashboard' },
      { name: 'Product Launch', desc: 'Go-to-market planning tools' },
      { name: 'Retail Execution', desc: 'Store audit and compliance' },
    ]
  },
  'oil-gas': {
    title: 'Oil & Gas',
    subtitle: 'Advanced technology for energy sector operations',
    color: '#1a3a6b',
    heroBg: 'linear-gradient(135deg, #f0f4fa 0%, #e8eef8 100%)',
    solutions: [
      { name: 'Asset Monitoring', desc: 'IoT sensor dashboard for rigs' },
      { name: 'Predictive Maintenance', desc: 'Equipment failure prevention' },
      { name: 'Reservoir Modeling', desc: '3D visualization and simulation' },
      { name: 'Safety Compliance', desc: 'Incident tracking and reporting' },
      { name: 'Production Optimization', desc: 'Real-time well performance' },
      { name: 'Pipeline Integrity', desc: 'Leak detection system' },
    ]
  },
  'chemical': {
    title: 'Chemical',
    subtitle: 'Digital solutions for chemical manufacturing excellence',
    color: '#3a8c3a',
    heroBg: 'linear-gradient(135deg, #f0faf0 0%, #e8f5e8 100%)',
    solutions: [
      { name: 'Process Control', desc: 'Real-time reaction monitoring' },
      { name: 'Batch Management', desc: 'Recipe and quality tracking' },
      { name: 'Safety Dashboard', desc: 'Hazard and risk assessment' },
      { name: 'Inventory Management', desc: 'Chemical storage optimization' },
      { name: 'Quality Assurance', desc: 'Lab testing and certification' },
      { name: 'Sustainability Metrics', desc: 'Environmental impact tracking' },
    ]
  },
  'metal-mining': {
    title: 'Metal & Mining',
    subtitle: 'Smart mining solutions for sustainable operations',
    color: '#7a1a3a',
    heroBg: 'linear-gradient(135deg, #fdf5f8 0%, #f5eef2 100%)',
    solutions: [
      { name: 'Fleet Management', desc: 'Heavy machinery tracking' },
      { name: 'Ore Grade Analysis', desc: 'Real-time mineral quality' },
      { name: 'Worker Safety', desc: 'Underground monitoring system' },
      { name: 'Blast Planning', desc: 'Optimization and simulation' },
      { name: 'Mine Ventilation', desc: 'Air quality control dashboard' },
      { name: 'Production Planning', desc: 'Resource allocation tools' },
    ]
  },
  'infrastructure': {
    title: 'Infrastructure',
    subtitle: 'Building the future with smart infrastructure solutions',
    color: '#0096c7',
    heroBg: 'linear-gradient(135deg, #f0faff 0%, #e0f4fc 100%)',
    solutions: [
      { name: 'Project Management', desc: 'Timeline and budget tracking' },
      { name: 'BIM Integration', desc: '3D model collaboration' },
      { name: 'Equipment Tracking', desc: 'Asset location and utilization' },
      { name: 'Quality Inspections', desc: 'Mobile site audit tools' },
      { name: 'Workforce Planning', desc: 'Labor allocation dashboard' },
      { name: 'Material Management', desc: 'Supply chain optimization' },
    ]
  },
  'automotive': {
    title: 'Automotive & Tire',
    subtitle: 'Driving innovation in mobility and manufacturing',
    color: '#c0193c',
    heroBg: 'linear-gradient(135deg, #fff0f3 0%, #fde8ed 100%)',
    solutions: [
      { name: 'Production Line', desc: 'Assembly monitoring system' },
      { name: 'Quality Control', desc: 'Tire testing and validation' },
      { name: 'Supply Chain', desc: 'Just-in-time inventory' },
      { name: 'Dealer Network', desc: 'Sales and distribution portal' },
      { name: 'Connected Vehicle', desc: 'Telematics data analytics' },
      { name: 'Warranty Management', desc: 'Claims processing system' },
    ]
  },
  'cement': {
    title: 'Cement',
    subtitle: 'Modernizing cement production and distribution',
    color: '#d4a017',
    heroBg: 'linear-gradient(135deg, #fffaf0 0%, #fef5e0 100%)',
    solutions: [
      { name: 'Kiln Optimization', desc: 'Temperature and fuel control' },
      { name: 'Quality Monitoring', desc: 'Strength testing dashboard' },
      { name: 'Energy Management', desc: 'Power consumption analytics' },
      { name: 'Logistics Tracking', desc: 'Truck dispatch and delivery' },
      { name: 'Plant Maintenance', desc: 'Equipment health monitoring' },
      { name: 'Emissions Control', desc: 'Environmental compliance' },
    ]
  }
};

function showDetail(id) {
  const ind = industries[id];
  document.getElementById('view-industries').style.display = 'none';
  document.getElementById('view-detail').style.display = 'block';

  // Set CSS accent
  document.getElementById('view-detail').style.setProperty('--accent', ind.color);

  // Hero
  const hero = document.getElementById('detail-hero');
  hero.style.background = ind.heroBg;

  document.getElementById('detail-badge').style.color = ind.color;
  document.getElementById('detail-title').textContent = ind.title;
  document.getElementById('detail-subtitle').textContent = ind.subtitle;
  document.getElementById('section-sub').textContent = `Explore our comprehensive suite of digital solutions designed specifically for ${ind.title.toLowerCase()}`;

  // Solutions
  const grid = document.getElementById('solutions-grid');
  grid.innerHTML = '';
  ind.solutions.forEach((sol, i) => {
    const delay = (i + 1);
    const card = document.createElement('div');
    card.className = `solution-card animate-in anim-delay-${delay <= 6 ? delay : 6}`;
    card.style.setProperty('--accent', ind.color);
    card.innerHTML = `
      <div class="solution-num">0${i+1}</div>
      <h4>${sol.name}</h4>
      <p class="sol-desc">${sol.desc}</p>
      <button class="demo-btn" style="background:${ind.color}">View Demo</button>
      <div class="available-tag">Available Now</div>
    `;
    grid.appendChild(card);
  });

  window.scrollTo(0, 0);
}

function showIndustries() {
  document.getElementById('view-industries').style.display = 'block';
  document.getElementById('view-detail').style.display = 'none';
  window.scrollTo(0, 0);
}
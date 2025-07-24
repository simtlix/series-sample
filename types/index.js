// Types index - centralized type loading
// Load types in dependency order to avoid circular dependency issues

// Independent types first
require('./director');
require('./star');

// Types that depend on the above
require('./assignedStarAndSerie');
require('./season');
require('./episode');

// Main types that reference others
require('./serie');

module.exports = {
  // Re-export types if needed
  director: require('./director'),
  star: require('./star'),
  assignedStarAndSerie: require('./assignedStarAndSerie'),
  season: require('./season'),
  episode: require('./episode'),
  serie: require('./serie')
}; 
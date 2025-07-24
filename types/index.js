// Types index - centralized type loading
// Load types in dependency order to avoid circular dependency issues

// Independent types first
import './director.js';
import './star.js';

// Types that depend on the above
import './assignedStarAndSerie.js';
import './season.js';
import './episode.js';

// Main types that reference others
import './serie.js';

// Re-export types if needed
import director from './director.js';
import star from './star.js';
import assignedStarAndSerie from './assignedStarAndSerie.js';
import season from './season.js';
import episode from './episode.js';
import serie from './serie.js';

export {
  director,
  star,
  assignedStarAndSerie,
  season,
  episode,
  serie
}; 
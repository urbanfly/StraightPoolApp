Player
- id
- name
- high-run
- mean
- stDev
- win/loss
- handicap? (pointsNeededToWin)

Match
- timestamp?
- pointLimit
- ballsRemaining
- Players[]
- currentPlayer
- Turns[]
    - playerId
    - ending
    - successfulSafety
    - points
    - balls
    - finishedRacks
    - timestamp?
- getPlayerStats(player, turns)
    - name
    - score
    - avg
    - high-run
    - stdDev
    - consecutiveFouls
    - total fouls
    - total misses
    - total safeties
    - total successfulSafeties
    - total finished racks
    - total errors

League
- name
- location
- Season[]
    - Players[]
    - Schedule
    - Matches[]

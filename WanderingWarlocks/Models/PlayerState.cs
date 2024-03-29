namespace WanderingWarlocks.Models
{
    public class PlayerState
    {

        public double x { get; set; }
        public double y { get; set; }
        public string key { get; set; }

        public string angle { get; set; }
        public string health { get; set; }
        public int kills { get; set; }

        public string velocity { get; set;  }
        public PlayerState(double x, double y, string key, string angle, string velocity, string health, int kills)
        {
            this.key = key;
            this.x = x;
            this.y = y;
            this.velocity = velocity;
            this.angle = angle;
            this.health = health;
            this.kills = kills;
        }

    }
}
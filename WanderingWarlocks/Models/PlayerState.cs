namespace WanderingWarlocks.Models
{
    public class PlayerState
    {

        public double x { get; set; }
        public double y { get; set; }
        public string key { get; set; }
        public string anims { get; set; }



        public PlayerState(double x, double y, string key, string anims)
        {
            this.key = key;
            this.x = x;
            this.y = y; 
            this.anims = anims;
        }

    }
}
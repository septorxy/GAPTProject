namespace Testing.Models
{
    public class PlayerState
    {
        public string name { get; set; }
        public int x{ get; set; }
        public int y { get; set; }

        public PlayerState(string name, int x, int y)
        {
            this.name = name;
            this.x = x;
            this.y = y;
        }
        
    }
}
